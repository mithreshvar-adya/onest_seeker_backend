export const REGISTRY_BASE_URL = {
  "staging": "https://staging.registry.ondc.org/",
  "preprod": "https://preprod.registry.ondc.org/ondc/",
  "production": "https://prod.registry.ondc.org/"
}

export const ONDC_PUBLIC_KEY={
  "staging":"MCowBQYDK2VuAyEAduMuZgmtpjdCuxv+Nc49K0cB6tL/Dj3HZetvVN7ZekM=",
  "preprod":"MCowBQYDK2VuAyEAa9Wbpvd9SsrpOZFcynyt/TO3x0Yrqyys4NUGIvyxX2Q=",
  "production":"MCowBQYDK2VuAyEAduMuZgmtpjdCuxv+Nc49K0cB6tL/Dj3HZetvVN7ZekM="
}

export const PROTOCOL_BASE_URL = {
  "staging": "https://staging.gateway.proteantech.in",
  "preprod": "https://preprod.gateway.ondc.org",
  "production": "https://prod.gateway.ondc.org"
}

export enum ENUM_ACTIONS {
  SEARCH = 'search',
  ON_SEARCH = 'on_search',
  SELECT = 'select',
  ON_SELECT = 'on_select',
  INIT = 'init',
  ON_INIT = 'on_init',
  CONFIRM = 'confirm',
  ON_CONFIRM = 'on_confirm',
  UPDATE = 'update',
  ON_UPDATE = 'on_update',
  STATUS = 'status',
  ON_STATUS = 'on_status',
  CANCEL = 'cancel',
  ON_CANCEL = 'on_cancel',
}
export enum ONEST_VERSIONS {
  v_1_1_0 = "1.1.0",
  v_1_2_0 = "1.2.0",
}

export const BAP_KEYS={
  UNIQUE_KEY_ID: "c61c5d70-9859-4437-84bd-7d58640dc4c5",
  LEARNING_UNIQUE_KEY_ID: "0abc123d-456e-789f-0123-bcde4567890f",
  JOB_UNIQUE_KEY_ID: "cf6d50e2-f8bc-4b12-ab65-2d8db0671d24",
  PRIVATE_KEY: "JNOMEJZPIaBZmjjEBsAdm11u6M5x8lYyyjbtWG61b/IZOm+u1p83ZRFnSfnugOlbJWA31vFyKxUVC3xSYmUi2g==",
  ONDC_PUBLIC_KEY: "MCowBQYDK2VuAyEAvVEyZY91O2yV8w8/CAwVDAnqIZDJJUPdLUUKwLo3K0M=",
  ENCRYPTION_PRIVATE_KEY: "MC4CAQAwBQYDK2VuBCIEILA658KMcLC4SGBSNZIz8jza4x56nevE8YRORHK5NUhs",

}

export const TELEMETRY_BASE_URL = {
  "base_url": "https://webhook.site/2a8f0589-be46-4049-b4d5-ca0c879902b4"
}

export const ONDC_LAYER_BASE_URL = {
  "base_url": "http://localhost:4020/api/v1"
}