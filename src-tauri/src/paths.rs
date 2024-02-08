const PROJECT_FOLDER_NAME: &str = ".bits-wallet";

pub struct UserPaths;

impl UserPaths {
    pub fn new() -> Self {
        UserPaths
    }

    pub fn home_dir(&self) -> String {
        // use pathos to android directory for this app
        "/data/user/0/com.tauri.desktop_v2".to_string() // android
    }

    pub fn project_base_dir(&self) -> String {
        format!("{}/{}", self.home_dir(), PROJECT_FOLDER_NAME)
    }

    pub fn wallet_dir(&self, wallet_name: &str) -> String {
        format!("{}/{}", self.project_base_dir(), wallet_name)
    }

    pub fn seed_file(&self, wallet_name: &str) -> String {
        format!("{}/seed.txt", self.wallet_dir(wallet_name))
    }

    pub fn config_file(&self, wallet_name: &str) -> String {
        format!("{}/config.json", self.wallet_dir(wallet_name))
    }

    pub fn ldk_data_dir(&self, wallet_name: &str) -> String {
        format!("{}/ldk-data", self.wallet_dir(wallet_name))
    }
}
