#!/usr/bin/env node

/**
 * DZT Open-Data MCP Stdio Bridge
 * Connects Antigravity to the official DZT Open-Data Knowledge Graph MCP Server.
 */

import https from 'https';
import readline from 'readline';

const API_KEY = '647e87679f71e0ec10f66056ad0721ef';
const DZT_ENDPOINT = 'https://proxy.opendatagermany.io/api/its/mcp';

async function forwardToDzt(requestBody) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(requestBody);
    const url = new URL(DZT_ENDPOINT);

    const req = https.request({
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': API_KEY,
        'User-Agent': 'Antigravity-DZT-Bridge/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          resolve({
            jsonrpc: '2.0',
            id: requestBody.id,
            error: { code: -32603, message: `Invalid response from DZT: ${err.message}` }
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        jsonrpc: '2.0',
        id: requestBody.id,
        error: { code: -32603, message: `DZT connection error: ${err.message}` }
      });
    });

    req.write(postData);
    req.end();
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const message = JSON.parse(trimmed);

    // Handle standard MCP lifecycle requests
    if (message.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'dzt-opendata',
            version: '1.0.0'
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (message.method === 'notifications/initialized' || message.method === 'initialized') {
      return;
    }

    if (message.method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: {} }) + '\n');
      return;
    }

    // Forward tools/list, tools/call and other JSON-RPC methods directly to DZT
    const dztResponse = await forwardToDzt(message);
    process.stdout.write(JSON.stringify(dztResponse) + '\n');
  } catch (err) {
    const errResponse = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` }
    };
    process.stdout.write(JSON.stringify(errResponse) + '\n');
  }
});
