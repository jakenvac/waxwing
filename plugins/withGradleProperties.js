const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withCustomGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    // Use conservative memory settings that work on most machines and CI environments
    // 3GB heap + 768MB metaspace is sufficient for this app's build needs
    const jvmArgs = '-Xmx3072m -XX:MaxMetaspaceSize=768m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8';
    
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: jvmArgs,
    });
    return config;
  });
};
