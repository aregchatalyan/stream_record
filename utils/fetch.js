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

    if (response.headers.get('content-type') === 'text/plain') {
      data = await response.text();
    } else {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong...');
    }

    return data;
  } catch (e) {
    throw new Error(e.message ? e.message : 'Internal Server Error');
  }
}