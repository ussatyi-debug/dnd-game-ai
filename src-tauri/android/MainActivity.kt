// Главная активность Android: игра на весь экран.
// Строка состояния и кнопки навигации скрыты и появляются поверх игры по свайпу —
// сверху панель, снизу кнопки — и снова прячутся сами, как в играх и видеоплеерах.
// Файл копируется в проект Android при сборке (CI, шаг «Проект Android»).
package PACKAGE_NAME

import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    hideSystemBars()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // После диалогов, клавиатуры и возврата в приложение панели снова прячутся.
    if (hasFocus) hideSystemBars()
  }

  private fun hideSystemBars() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    controller.hide(WindowInsetsCompat.Type.systemBars())
  }
}
