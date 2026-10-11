// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Sets the iOS status-bar icon style to match the in-app Mantine color scheme.
///
/// The JS layer passes the raw Mantine preference (`"auto"` | `"light"` |
/// `"dark"`). `"auto"` maps to `UIUserInterfaceStyle::Unspecified` so the native
/// window, status bar, and WKWebView keep tracking the system appearance, which
/// is what Mantine's `auto` mode requires. This is a no-op on non-iOS
/// platforms; on iOS the UIKit work runs on the main thread because the
/// relevant classes are main-thread-only.
#[tauri::command]
fn set_status_bar_style(window: tauri::WebviewWindow, scheme: String) {
    #[cfg(target_os = "ios")]
    {
        let handle = window.clone();
        if let Err(error) = window.run_on_main_thread(move || {
            if let Err(error) = apply_ios_status_bar_style(&handle, &scheme) {
                eprintln!("failed to set iOS status bar style: {error}");
            }
        }) {
            eprintln!("failed to dispatch iOS status bar update: {error}");
        }
    }
    #[cfg(not(target_os = "ios"))]
    {
        let _ = (window, scheme);
    }
}

/// Applies the requested scheme to the invoking window and its root view controller.
#[cfg(target_os = "ios")]
fn apply_ios_status_bar_style(
    window: &tauri::WebviewWindow,
    scheme: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    use objc2_ui_kit::{UIUserInterfaceStyle, UIView, UIViewController};
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};

    let style = match scheme {
        "dark" => UIUserInterfaceStyle::Dark,
        "light" => UIUserInterfaceStyle::Light,
        _ => UIUserInterfaceStyle::Unspecified,
    };

    let handle = window.window_handle()?;
    let RawWindowHandle::UiKit(uikit) = handle.as_raw() else {
        return Ok(());
    };

    // SAFETY: this runs on the main thread; the pointers are valid UIKit objects
    // owned by the live window and outlive this call.
    let view: &UIView = unsafe { &*(uikit.ui_view.as_ptr() as *const UIView) };

    if let Some(window) = view.window() {
        window.setOverrideUserInterfaceStyle(style);
    }

    if let Some(controller) = uikit.ui_view_controller {
        // SAFETY: as above.
        let controller: &UIViewController =
            unsafe { &*(controller.as_ptr() as *const UIViewController) };
        controller.setOverrideUserInterfaceStyle(style);
        controller.setNeedsStatusBarAppearanceUpdate();
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_geolocation::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, set_status_bar_style])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, _event| {
            // `UIApplicationSupportsMultipleScenes` stays `true` because the
            // static `UIApplicationSceneManifest` is what the iOS 27 launch
            // validator inspects. WizCast is single-window, so an unhandled
            // scene request would otherwise present a blank window; present the
            // app's normal window for the new scene instead.
            #[cfg(target_os = "ios")]
            if let tauri::RunEvent::SceneRequested { scene, .. } = &_event {
                present_scene_window(_app, scene);
            }
        });
}

/// Presents the app's standard window for a scene requested by the system.
#[cfg(target_os = "ios")]
fn present_scene_window(app: &tauri::AppHandle, scene: &objc2_ui_kit::UIScene) {
    use tauri::Manager;

    let identifier = scene.session().persistentIdentifier().to_string();
    let label = format!("scene-{identifier}");

    if app.get_webview_window(&label).is_some() {
        return;
    }

    if let Err(error) = tauri::WebviewWindowBuilder::new(
        app,
        &label,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("WizCast")
    .build()
    {
        eprintln!("failed to present window for requested scene {label}: {error}");
    }
}
