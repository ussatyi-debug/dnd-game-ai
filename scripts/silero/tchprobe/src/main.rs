// Проверка: libtorch из Rust грузит модели Silero и синтезирует фразу.
use tch::{CModule, IValue, Kind, Tensor};

fn main() {
    let dir = std::env::args().nth(1).unwrap_or_else(|| "out".into());
    tch::set_num_threads(2);
    let stress = CModule::load(format!("{dir}/silero_stress.jit")).expect("stress");
    let words = IValue::GenericList(vec![
        IValue::String("грегори".into()),
        IValue::String("замок".into()),
        IValue::String("елка".into()),
    ]);
    let out = stress.method_is("forward", &[words]).expect("stress forward");
    let shown: String = format!("{out:?}").chars().take(300).collect();
    println!("STRESS {shown}");

    let tts = CModule::load(format!("{dir}/silero_tts.jit")).expect("tts");
    let ids: Vec<i64> = vec![2, 28, 29, 21, 15, 5, 18, 31, 6, 84, 25, 21, 29, 8, 1];
    let n = ids.len() as i64;
    let seq = Tensor::from_slice(&ids).view([1, n]);
    let spk = Tensor::from_slice(&[0i64]);
    let ones = Tensor::ones([1, n], (Kind::Float, tch::Device::Cpu));
    let t = std::time::Instant::now();
    let res = tts
        .method_is(
            "forward",
            &[
                IValue::Tensor(seq),
                IValue::Tensor(spk),
                IValue::Int(24000),
                IValue::None,
                IValue::Tensor(ones.shallow_clone()),
                IValue::Tensor(ones),
            ],
        )
        .expect("tts forward");
    if let IValue::Tuple(v) = res {
        if let IValue::Tensor(a) = &v[0] {
            println!("AUDIO {:?} in {:?}", a.size(), t.elapsed());
        }
    }
}
