import Busboy from 'busboy';

const maxBodyBytes = 4 * 1024 * 1024;

export function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBodyBytes) reject(Object.assign(new Error('PAYLOAD_TOO_LARGE'), { status: 413 }));
    });
    request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(Object.assign(new Error('INVALID_JSON'), { status: 400 })); } });
    request.on('error', reject);
  });
}

export function readMultipart(request) {
  return new Promise((resolve, reject) => {
    const contentType = request.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) return reject(Object.assign(new Error('INVALID_MULTIPART'), { status: 400 }));
    const fields = {};
    let image;
    let total = 0;
    let failed = false;
    const parser = Busboy({ headers: request.headers, limits: { files: 1, fileSize: maxBodyBytes, fields: 4, fieldSize: 10000 } });
    parser.on('field', (name, value) => { fields[name] = value; });
    parser.on('file', (name, stream, info) => {
      if (name !== 'image') return stream.resume();
      const chunks = [];
      stream.on('data', chunk => { total += chunk.length; chunks.push(chunk); if (total > maxBodyBytes && !failed) { failed = true; reject(Object.assign(new Error('PAYLOAD_TOO_LARGE'), { status: 413 })); } });
      stream.on('limit', () => { failed = true; reject(Object.assign(new Error('PAYLOAD_TOO_LARGE'), { status: 413 })); });
      stream.on('end', () => { image = { filename: info.filename, mimeType: info.mimeType, data: Buffer.concat(chunks) }; });
    });
    parser.on('error', reject);
    parser.on('finish', () => { if (!failed) resolve({ fields, image }); });
    request.on('error', reject);
    request.pipe(parser);
  });
}
