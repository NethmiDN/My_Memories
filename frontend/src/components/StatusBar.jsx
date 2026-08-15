import React from 'react';
import { Network } from 'lucide-react';

export default function StatusBar({ meshStatus }) {
  return (
    <section className="system-status-bar glass-card">
      <div className="status-title">
        <Network size={16} /> Microservices Mesh Status:
      </div>
      <div className="status-indicators">
        <div id="status-gateway" className={`status-pill ${meshStatus.gateway ? 'status-online' : 'status-offline'}`}>
          <span className="dot"></span> Gateway <code>:8080</code>
        </div>
        <div id="status-user-service" className={`status-pill ${meshStatus.users ? 'status-online' : 'status-offline'}`}>
          <span className="dot"></span> User Service <code>:8081</code>
        </div>
        <div id="status-event-service" className={`status-pill ${meshStatus.events ? 'status-online' : 'status-offline'}`}>
          <span className="dot"></span> Event Service <code>:8082</code>
        </div>
        <div id="status-media-service" className={`status-pill ${meshStatus.media ? 'status-online' : 'status-offline'}`}>
          <span className="dot"></span> Media Service (GCP) <code>:8083</code>
        </div>
      </div>
    </section>
  );
}
