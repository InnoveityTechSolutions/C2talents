const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function isPortOpen(port = 3306, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      status = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function findMysql() {
  const possiblePaths = [
    'C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64',
    'C:\\laragon\\bin\\mysql',
    'C:\\xampp\\mysql',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0',
    'C:\\Program Files\\MySQL\\MySQL Server 8.4',
  ];

  for (const base of possiblePaths) {
    if (fs.existsSync(base)) {
      const directBin = path.join(base, 'bin', 'mysqld.exe');
      if (fs.existsSync(directBin)) {
        const myIni = path.join(base, 'my.ini');
        return {
          bin: directBin,
          ini: fs.existsSync(myIni) ? myIni : null,
        };
      }
      try {
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const candidateBin = path.join(base, entry.name, 'bin', 'mysqld.exe');
            if (fs.existsSync(candidateBin)) {
              const candidateIni = path.join(base, entry.name, 'my.ini');
              return {
                bin: candidateBin,
                ini: fs.existsSync(candidateIni) ? candidateIni : null,
              };
            }
          }
        }
      } catch (e) {}
    }
  }
  return null;
}

async function ensureMysql() {
  const isOpen = await isPortOpen(3306);
  if (isOpen) {
    console.log('✅ [DATABASE] MySQL is running on port 3306.');
    return true;
  }

  console.log('⚠️ [DATABASE] MySQL is not reachable on port 3306. Attempting to start local MySQL...');
  const mysqlInfo = findMysql();
  if (!mysqlInfo) {
    console.error('❌ [DATABASE] Could not locate MySQL binary. Please start Laragon or MySQL manually.');
    return false;
  }

  const args = [];
  if (mysqlInfo.ini) {
    args.push(`--defaults-file=${mysqlInfo.ini}`);
  }
  args.push('--console');

  console.log(`🚀 [DATABASE] Spawning MySQL service: ${mysqlInfo.bin}...`);
  const child = spawn(mysqlInfo.bin, args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  for (let i = 0; i < 15; i++) {
    await new Promise((res) => setTimeout(res, 1000));
    if (await isPortOpen(3306)) {
      console.log('✅ [DATABASE] MySQL started and ready for connections on port 3306.');
      return true;
    }
  }

  console.error('❌ [DATABASE] MySQL process spawned but port 3306 is not responding yet.');
  return false;
}

if (require.main === module) {
  ensureMysql().then((ok) => {
    process.exit(ok ? 0 : 1);
  });
}

module.exports = { ensureMysql, isPortOpen };
