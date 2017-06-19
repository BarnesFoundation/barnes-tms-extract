require('seneca')()

  .use('./colorProcessPluginAPI.js')
  .listen({ type: 'tcp', pin: 'role:color', port: 10205 });
