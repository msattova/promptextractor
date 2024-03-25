// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod read_png;


#[tauri::command]
fn read_png(path: &str) -> String {
    read_png::read_png(path.into())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_png])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
