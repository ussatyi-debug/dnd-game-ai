//! Встроенный Silero на Windows: синтез речи `v5_cis_base` и ударения `silero-stress`
//! (обе модели — MIT) через libtorch, без Python.
//!
//! Модели лежат в папке ресурсов приложения `silero/` (их готовит `scripts/silero/export.py`
//! при сборке): `silero_tts.jit`, `silero_meta.json`, `silero_stress.jit`,
//! `silero_stress_exceptions.json`. Подготовка текста повторяет код пакетов Silero:
//! ударения (словарь исключений + модель), затем символы → номера по алфавиту модели.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::Deserialize;
use tch::{CModule, IValue, Kind, Tensor};

use super::VoiceInfo;

/// Частота звука: модель отдаёт 8, 24 или 48 кГц; 24 кГц — баланс качества и скорости.
pub const SAMPLE_RATE: u32 = 24_000;

#[derive(Deserialize)]
struct Meta {
    symbol_to_id: HashMap<String, i64>,
    speakers: HashMap<String, i64>,
    sos: String,
    eos: String,
}

pub struct Silero {
    tts: CModule,
    stress: CModule,
    symbols: HashMap<char, i64>,
    speakers: HashMap<String, i64>,
    sos: i64,
    eos: i64,
    /// Слово → (позиция ударной буквы, позиция «ё» или −1).
    exceptions: HashMap<String, (i64, i64)>,
}

/// Папка моделей рядом с приложением.
pub fn model_dir(resource_dir: &Path) -> PathBuf {
    resource_dir.join("silero")
}

pub fn installed(resource_dir: &Path) -> bool {
    let dir = model_dir(resource_dir);
    ["silero_tts.jit", "silero_meta.json", "silero_stress.jit", "silero_stress_exceptions.json"]
        .iter()
        .all(|f| dir.join(f).is_file())
}

const VOWELS: &str = "аоуыэиеяёю";

/// Русские имена дикторов `ru_*` и их пол.
const NAMES: [(&str, &str, &str); 27] = [
    ("aigul", "Айгуль", "f"),
    ("albina", "Альбина", "f"),
    ("alexandr", "Александр", "m"),
    ("alfia", "Альфия", "f"),
    ("alfia2", "Альфия (2)", "f"),
    ("bogdan", "Богдан", "m"),
    ("dmitriy", "Дмитрий", "m"),
    ("ekaterina", "Екатерина", "f"),
    ("vika", "Вика", "f"),
    ("gamat", "Гамат", "m"),
    ("igor", "Игорь", "m"),
    ("karina", "Карина", "f"),
    ("kejilgan", "Кежилган", "f"),
    ("kermen", "Кермен", "f"),
    ("marat", "Марат", "m"),
    ("miyau", "Мияу", "f"),
    ("nurgul", "Нургуль", "f"),
    ("oksana", "Оксана", "f"),
    ("onaoy", "Онаой", "f"),
    ("ramilia", "Рамиля", "f"),
    ("roman", "Роман", "m"),
    ("safarhuja", "Сафархуджа", "m"),
    ("sibday", "Сибдай", "m"),
    ("timur", "Тимур", "m"),
    ("tolibjon", "Толибджон", "m"),
    ("ulbolsun", "Улболсун", "f"),
    ("zhadyra", "Жадыра", "f"),
];

fn voice_info(id: &str) -> VoiceInfo {
    let short = id.trim_start_matches("ru_");
    match NAMES.iter().find(|(k, _, _)| *k == short) {
        Some((_, name, gender)) => {
            VoiceInfo { id: id.into(), name: (*name).into(), gender: (*gender).into() }
        }
        None => VoiceInfo { id: id.into(), name: short.into(), gender: String::new() },
    }
}

fn err(what: &str, e: impl std::fmt::Display) -> String {
    format!("Silero: {what}: {e}")
}

impl Silero {
    pub fn load(resource_dir: &Path) -> Result<Self, String> {
        let dir = model_dir(resource_dir);
        let read = |f: &str| {
            std::fs::read_to_string(dir.join(f)).map_err(|e| err(&format!("нет файла {f}"), e))
        };
        let meta: Meta =
            serde_json::from_str(&read("silero_meta.json")?).map_err(|e| err("meta", e))?;
        let raw: HashMap<String, Vec<i64>> =
            serde_json::from_str(&read("silero_stress_exceptions.json")?)
                .map_err(|e| err("исключения ударений", e))?;
        let exceptions = raw
            .into_iter()
            .filter_map(|(w, v)| Some((w, (*v.first()?, *v.get(1).unwrap_or(&-1)))))
            .collect();
        let id = |s: &str| meta.symbol_to_id.get(s).copied().ok_or_else(|| err("нет символа", s));
        let (sos, eos) = (id(&meta.sos)?, id(&meta.eos)?);
        let symbols = meta
            .symbol_to_id
            .iter()
            .filter_map(|(k, v)| {
                let mut chars = k.chars();
                match (chars.next(), chars.next()) {
                    (Some(c), None) => Some((c, *v)),
                    _ => None,
                }
            })
            .collect();
        tch::set_num_threads(
            std::thread::available_parallelism().map(|n| n.get().clamp(1, 4)).unwrap_or(2) as i32,
        );
        let tts = CModule::load(dir.join("silero_tts.jit")).map_err(|e| err("модель речи", e))?;
        let stress =
            CModule::load(dir.join("silero_stress.jit")).map_err(|e| err("модель ударений", e))?;
        Ok(Self { tts, stress, symbols, speakers: meta.speakers, sos, eos, exceptions })
    }

    pub fn voices(&self) -> Vec<VoiceInfo> {
        let mut out: Vec<VoiceInfo> = self.speakers.keys().map(|k| voice_info(k)).collect();
        out.sort_by(|a, b| a.name.cmp(&b.name));
        out
    }

    /// Фраза → звук (отсчёты −1…1, [`SAMPLE_RATE`]).
    pub fn synth(&self, text: &str, voice: &str, rate: f32) -> Result<Vec<f32>, String> {
        let speaker = *self
            .speakers
            .get(voice)
            .or_else(|| self.speakers.get("ru_dmitriy"))
            .ok_or("Silero: нет голоса")?;
        let accented = self.accent(text)?;
        let ids = self.encode(&accented);
        if ids.len() <= 2 {
            return Ok(Vec::new());
        }
        let n = ids.len() as i64;
        let seq = Tensor::from_slice(&ids).view([1, n]);
        let spk = Tensor::from_slice(&[speaker]);
        let rate_t =
            Tensor::full([1, n], rate.clamp(0.5, 2.0) as f64, (Kind::Float, tch::Device::Cpu));
        let pitch = Tensor::ones([1, n], (Kind::Float, tch::Device::Cpu));
        let out = tch::no_grad(|| {
            self.tts.method_is(
                "forward",
                &[
                    IValue::Tensor(seq),
                    IValue::Tensor(spk),
                    IValue::Int(SAMPLE_RATE as i64),
                    IValue::None,
                    IValue::Tensor(rate_t),
                    IValue::Tensor(pitch),
                ],
            )
        })
        .map_err(|e| err("синтез", e))?;
        let audio = match out {
            IValue::Tuple(mut v) if !v.is_empty() => match v.swap_remove(0) {
                IValue::Tensor(t) => t,
                _ => return Err("Silero: неожиданный ответ модели".into()),
            },
            _ => return Err("Silero: неожиданный ответ модели".into()),
        };
        Vec::<f32>::try_from(audio.view([-1]).to_kind(Kind::Float)).map_err(|e| err("звук", e))
    }

    /// Текст → номера символов модели: строчные, только алфавит модели и «+», sos/eos по краям.
    fn encode(&self, text: &str) -> Vec<i64> {
        let lower = text.to_lowercase().replace(['—', '‑'], "–");
        let mut out = vec![self.sos];
        let mut last_space = true;
        for c in lower.chars() {
            let c = if c.is_whitespace() { ' ' } else { c };
            if c == ' ' {
                if last_space {
                    continue;
                }
                last_space = true;
            } else {
                last_space = false;
            }
            if let Some(id) = self.symbols.get(&c) {
                if *id != self.sos && *id != self.eos {
                    out.push(*id);
                }
            }
        }
        if out.len() > 1 && self.symbols.get(&' ') == out.last() {
            out.pop();
        }
        out.push(self.eos);
        out
    }

    /// Ударения «+» перед ударной гласной и «ё» (как `silero-stress` без разбора омографов).
    fn accent(&self, text: &str) -> Result<String, String> {
        let tokens = tokenize(text);
        let batch: Vec<String> =
            tokens.iter().filter(|t| t.predict).map(|t| t.clean.clone()).collect();
        let preds = if batch.is_empty() { Vec::new() } else { self.predict(&batch)? };
        let mut preds = preds.into_iter();
        let mut out = String::with_capacity(text.len() + 16);
        for t in tokens {
            if !t.predict {
                out.push_str(&t.raw);
                continue;
            }
            let pred = preds.next();
            out.push_str(&self.accent_word(&t, pred));
        }
        Ok(out)
    }

    fn accent_word(&self, t: &Token, pred: Option<WordPred>) -> String {
        let raw: Vec<char> = t.raw.chars().collect();
        let lower: Vec<char> = t.raw.to_lowercase().chars().collect();
        if lower.contains(&'+') {
            return t.raw.clone();
        }
        if lower.contains(&'ё') {
            let mut s = String::new();
            for (i, c) in raw.iter().enumerate() {
                if lower.get(i) == Some(&'ё') {
                    s.push('+');
                }
                s.push(*c);
            }
            return s;
        }
        let vowel_pos: Vec<usize> = lower
            .iter()
            .enumerate()
            .filter(|(_, c)| VOWELS.contains(**c))
            .map(|(i, _)| i)
            .collect();
        if vowel_pos.is_empty() {
            return t.raw.clone();
        }
        let mut chars = raw.clone();
        // Позиции в словаре исключений — от первой буквы слова (без кавычек и скобок перед ней).
        let offset = lower.iter().position(|c| is_cyrillic(*c)).unwrap_or(0);
        let (stress, yo) = if let Some((s, y)) = self.exceptions.get(&t.clean) {
            (
                usize::try_from(*s).ok().map(|s| s + offset),
                usize::try_from(*y).ok().map(|y| y + offset),
            )
        } else if vowel_pos.len() == 1 {
            (Some(vowel_pos[0]), None)
        } else if let Some(p) = pred {
            let stress = (p.stress_prob > 0.5).then(|| vowel_pos.get(p.stress)).flatten().copied();
            let ye: Vec<usize> =
                lower.iter().enumerate().filter(|(_, c)| **c == 'е').map(|(i, _)| i).collect();
            let yo = (p.yo > 0 && p.yo_prob > 0.5)
                .then(|| ye.get(p.yo - 1))
                .flatten()
                .copied()
                .filter(|pos| Some(*pos) == stress);
            (stress, yo)
        } else {
            (None, None)
        };
        if let Some(y) = yo.filter(|y| *y < chars.len() && lower[*y] == 'е') {
            chars[y] = if chars[y].is_uppercase() { 'Ё' } else { 'ё' };
        }
        match stress.filter(|s| *s <= chars.len()) {
            Some(s) => {
                chars.insert(s, '+');
                chars.into_iter().collect()
            }
            None => chars.into_iter().collect(),
        }
    }

    fn predict(&self, words: &[String]) -> Result<Vec<WordPred>, String> {
        // Модель ударений обёрнута при экспорте: слова одной строкой через пробел.
        let line = IValue::String(words.join(" "));
        let out = tch::no_grad(|| self.stress.method_is("forward", &[line]))
            .map_err(|e| err("ударения", e))?;
        let (stress, yo) = match out {
            IValue::Tuple(v) if v.len() == 2 => match (&v[0], &v[1]) {
                (IValue::Tensor(a), IValue::Tensor(b)) => (a.shallow_clone(), b.shallow_clone()),
                _ => return Err("Silero: неожиданный ответ модели ударений".into()),
            },
            _ => return Err("Silero: неожиданный ответ модели ударений".into()),
        };
        let pick = |t: &Tensor| -> Result<Vec<(usize, f32)>, String> {
            let probs = t.softmax(1, Kind::Float);
            let (values, idx) = probs.max_dim(1, false);
            let values = Vec::<f32>::try_from(values).map_err(|e| err("ударения", e))?;
            let idx = Vec::<i64>::try_from(idx).map_err(|e| err("ударения", e))?;
            Ok(idx.into_iter().map(|i| i.max(0) as usize).zip(values).collect())
        };
        let s = pick(&stress)?;
        let y = pick(&yo)?;
        Ok(s.into_iter()
            .zip(y)
            .map(|((stress, stress_prob), (yo, yo_prob))| WordPred {
                stress,
                stress_prob,
                yo,
                yo_prob,
            })
            .collect())
    }
}

#[derive(Debug, Clone, Copy)]
struct WordPred {
    stress: usize,
    stress_prob: f32,
    yo: usize,
    yo_prob: f32,
}

#[derive(Debug, Clone, PartialEq)]
struct Token {
    raw: String,
    clean: String,
    predict: bool,
}

fn is_separator(c: char) -> bool {
    c.is_whitespace() || ".,!?;:<>=()/\\".contains(c)
}

fn is_cyrillic(c: char) -> bool {
    matches!(c, 'а'..='я' | 'А'..='Я' | 'ё' | 'Ё')
}

/// Слова и разделители, как `AccentorNgram._tokenize`: части через дефис — отдельные слова
/// («что-то»: «то» без ударения).
fn tokenize(text: &str) -> Vec<Token> {
    let mut out = Vec::new();
    let mut buf = String::new();
    let mut in_sep: Option<bool> = None;
    let flush = |buf: &mut String, sep: bool, out: &mut Vec<Token>| {
        if buf.is_empty() {
            return;
        }
        if sep {
            out.push(Token { raw: std::mem::take(buf), clean: String::new(), predict: false });
            return;
        }
        let word = std::mem::take(buf);
        let parts: Vec<&str> = word.split('-').collect();
        let count = parts.len();
        for (i, part) in parts.into_iter().enumerate() {
            let raw = if i + 1 < count { format!("{part}-") } else { part.to_string() };
            let clean: String = part.to_lowercase().chars().filter(|c| is_cyrillic(*c)).collect();
            let predict = !clean.is_empty() && !(count > 1 && i + 1 == count && clean == "то");
            out.push(Token { raw, clean, predict });
        }
    };
    for c in text.chars() {
        let sep = is_separator(c);
        if in_sep.is_some_and(|s| s != sep) {
            flush(&mut buf, in_sep.unwrap_or(false), &mut out);
        }
        in_sep = Some(sep);
        buf.push(c);
    }
    flush(&mut buf, in_sep.unwrap_or(false), &mut out);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokenize_splits_words_and_hyphens() {
        let t = tokenize("Кто-то, «Ив 7» и что-нибудь.");
        let raws: Vec<&str> = t.iter().map(|x| x.raw.as_str()).collect();
        assert_eq!(
            raws,
            ["Кто-", "то", ", ", "«Ив", " ", "7»", " ", "и", " ", "что-", "нибудь", "."]
        );
        assert!(!t[1].predict, "«то» в «кто-то» без ударения");
        assert_eq!(t[3].clean, "ив");
        assert!(!t[5].predict, "число без букв не размечается");
    }
}
