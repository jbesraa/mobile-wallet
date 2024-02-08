use pathos::user::app_data_dir;

const PROJECT_FOLDER_NAME: &str = ".bits-wallet";

pub struct UserPaths;

impl UserPaths {
    // pub fn home_dir(&self) -> String {
    //     // use pathos to android directory for this app
    // let a = app_data_dir("").unwrap();
    //     tauri_plugin_fs::
    //     // "/data/user/0/com.tauri.desktop_v2".to_string() // android
    // }

    pub fn project_base_dir() -> String {
        app_data_dir(PROJECT_FOLDER_NAME)
            .unwrap()
            .into_os_string()
            .to_str()
            .unwrap()
            .to_string()
        // format!("{}/{}", self.home_dir(), PROJECT_FOLDER_NAME)
    }

    pub fn seed_file() -> String {
        format!("{}/seed.txt", UserPaths::project_base_dir())
    }

    pub fn config_file() -> String {
        format!("{}/config.json", UserPaths::project_base_dir())
    }

    pub fn ldk_data_dir() -> String {
        format!("{}/ldk-data", UserPaths::project_base_dir())
    }
}
