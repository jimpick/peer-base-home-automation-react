import React, { useState, useEffect } from 'react';
import PeerBase from 'peer-base'
import IPFSRepo from 'ipfs-repo'
import MemoryDatastore from 'interface-datastore'
import { Set } from 'immutable'

const rooms = [
  'entrance',
  'living room',
  'kitchen',
  'bedroom',
  'den',
  'bathroom'
];

async function startPeerBase () {
  const app = PeerBase('lights-demo-2', {
    ipfs: {
      repo: new IPFSRepo('ipfs', {
        lock: 'memory',
        storageBackends: {
          root: MemoryDatastore.MemoryDatastore,
          blocks: MemoryDatastore.MemoryDatastore,
          keys: MemoryDatastore.MemoryDatastore,
          datastore: MemoryDatastore.MemoryDatastore
        }
      }),
      swarm: ['/dns4/rendezvous.jimpick.com/tcp/9091/wss/p2p-websocket-star'],
      // swarm: ['/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star'],
      bootstrap: [
        '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
        '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
        '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
        '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
        '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
        '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
        '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
        '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
      ]
    }
  });

  console.log('Starting...');
  await app.start();
  const collaboration = await app.collaborate('lights', 'rwlwwset');
  return [ app, collaboration ];
}

async function stopPeerBase (app, collaboration) {
  await collaboration.stop();
  await app.stop(true); // stop ipfs
}


export default function PeerBaseLights () {
  const [roomsSet, setRoomsSet] = useState(new Set());
  const [roomsShared, setRoomsShared] = useState();
  const [peers, setPeers] = useState();

  useEffect(() => {
    startPeerBase().then(([ app, collaboration ]) => {
      collaboration.on('state changed', update);
      collaboration.on('membership changed', updatePeers);
      setRoomsShared(collaboration.shared);
      return cleanup;

      function update () {
        setRoomsSet(Set(collaboration.shared.value()));
      }

      function updatePeers (peers) {
        setPeers(Set(peers));
      }

      function cleanup () {
        collaboration.removeListener('state changed', update);
        collaboration.removeListener('membership changed', updatePeers);
        stopPeerBase(app, collaboration);
        console.log('Cleanup');
      }
    })
  }, []);

  if (!roomsShared) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>Peers:</p>
      <ul>
        { peers && peers.map(peer => <li key={peer}>{peer}</li>) }
      </ul>
      <p>Rooms:</p>
      <ul>
        {
          rooms.map(room => (
            <li key={room}>
              <button onClick={toggle(room)}>Toggle</button>
              {room}: {roomsSet.has(room) ? 'On' : 'Off'}
            </li>
          ))
        }
      </ul>
    </div>
  );

  function toggle (room) {
    return () => {
      if (roomsSet.has(room)) {
        roomsShared.remove(Date.now(), room);
      } else {
        roomsShared.add(Date.now(), room);
      }
    }
  }
}
