exports.missingKey = () => 'You must configure the client with a client key';

exports.missingNamespace = () => 'You must configure the client with a Edge Config namespace binding';

exports.unsupportedOption = key => `Configuration option: ${key} not supported`;
