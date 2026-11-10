// Главная активность Android: игра на весь экран и озвучка системным синтезом речи.
// Строка состояния и кнопки навигации скрыты и появляются поверх игры по свайпу —
// сверху панель, снизу кнопки — и снова прячутся сами, как в играх и видеоплеерах.
// WebView Android не даёт странице speechSynthesis, поэтому озвучка без голосов Piper
// идёт через мост window.AndroidTts → android.speech.tts.TextToSpeech
// (события обратно — window.__androidTts(событие, id)). См. src/lib/tts.ts.
// Файл копируется в проект Android при сборке (CI, шаг «Проект Android»).
package PACKAGE_NAME

import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.util.Locale

class MainActivity : TauriActivity() {
  private var tts: TextToSpeech? = null
  private var ttsReady = false
  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    hideSystemBars()
    fitAboveKeyboard()
    tts = TextToSpeech(this) { status ->
      ttsReady = status == TextToSpeech.SUCCESS
      if (ttsReady) {
        tts?.language = Locale("ru", "RU")
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
          override fun onStart(id: String) = emit("start", id)
          override fun onDone(id: String) = emit("done", id)
          @Deprecated("Deprecated in Java")
          override fun onError(id: String) = emit("error", id)
          override fun onError(id: String, errorCode: Int) = emit("error", id)
          override fun onStop(id: String, interrupted: Boolean) = emit("stop", id)
        })
      }
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    this.webView = webView
    webView.addJavascriptInterface(TtsBridge(), "AndroidTts")
  }

  override fun onDestroy() {
    tts?.stop()
    tts?.shutdown()
    tts = null
    super.onDestroy()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // После диалогов, клавиатуры и возврата в приложение панели снова прячутся.
    if (hasFocus) hideSystemBars()
  }

  /**
   * На весь экран (decorFitsSystemWindows = false) Android не сжимает окно под клавиатуру,
   * и она перекрывает вкладки и кубы. Поднимаем содержимое на высоту клавиатуры сами.
   */
  private fun fitAboveKeyboard() {
    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      view.setPadding(0, 0, 0, keyboard)
      insets
    }
  }

  private fun hideSystemBars() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    controller.hide(WindowInsetsCompat.Type.systemBars())
  }

  private fun emit(event: String, id: String) {
    val view = webView ?: return
    val safeId = id.replace("\\", "").replace("'", "")
    view.post { view.evaluateJavascript("window.__androidTts && window.__androidTts('$event', '$safeId')", null) }
  }

  /** Методы, доступные странице как window.AndroidTts. */
  inner class TtsBridge {
    /** Готов ли синтез и есть ли русский голос. */
    @JavascriptInterface
    fun available(): Boolean {
      val engine = tts ?: return false
      if (!ttsReady) return false
      val result = engine.isLanguageAvailable(Locale("ru", "RU"))
      return result >= TextToSpeech.LANG_AVAILABLE
    }

    /** Поставить фразу в очередь; pitch различает голоса рассказчика и персонажей. */
    @JavascriptInterface
    fun speak(text: String, id: String, rate: Float, pitch: Float, volume: Float, flush: Boolean) {
      val engine = tts ?: return
      if (!ttsReady) {
        emit("error", id)
        return
      }
      engine.setSpeechRate(rate)
      engine.setPitch(pitch)
      val params = Bundle()
      params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume.coerceIn(0f, 1f))
      val mode = if (flush) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
      engine.speak(text, mode, params, id)
    }

    @JavascriptInterface
    fun stop() {
      tts?.stop()
    }
  }
}
