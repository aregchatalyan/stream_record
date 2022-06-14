const fetch = async (url, method = 'GET', body = null, headers = {}) => {
  const { default: fetch } = await import('node-fetch');

  return await fetch(url, { method, body, headers });
}

module.exports = async (...args) => {
  if (args.body) {
    args.body = JSON.stringify(args.body);
    args.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(...args);

    let data;
    const type =
      response.headers
        .get('content-type').split(';')[0]
      || response.headers
        .get('content-type');

    if ('application/json' === type) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong...');
    }

    return data;
  } catch (e) {
    return { status: 400, message: e.message };
  }
}