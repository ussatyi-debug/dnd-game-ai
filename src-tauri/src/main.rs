// В релизной сборке под Windows не открывать консольное окно.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    dnd_game_ai_lib::run()
}
