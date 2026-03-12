const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Configure Android app signing for release builds
 * Reads from keystore.properties file created by CI
 */
module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    // Add keystore.properties loading at the top of android block
    const keystorePropertiesCode = `
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
`;

    // Add release signing config
    const releaseSigningConfig = `
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            } else {
                // Fallback to debug keystore for local development
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;

    // Insert keystore properties loading before android { block
    buildGradle = buildGradle.replace(
      /android\s*\{/,
      `${keystorePropertiesCode}\nandroid {`
    );

    // Replace the debug signingConfig in signingConfigs block with release config
    buildGradle = buildGradle.replace(
      /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\})/,
      `$1\n${releaseSigningConfig}`
    );

    // Update release buildType to use release signingConfig
    buildGradle = buildGradle.replace(
      /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = buildGradle;
    return config;
  });
};
