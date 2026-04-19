// public/js/api/interfaces.js
// Minimal fetch wrapper with a MOCK mode to get started.
// Switch MOCK to false once your server endpoints are live.

const MOCK = true;

const mockData = {
  interfaces: [
    { id_interface: 1, name: "Ethernet" },
    { id_interface: 2, name: "WiFi" },
    { id_interface: 3, name: "UART" }
  ],
  features: [
    { id_feature: 10, name: "IPv4" },
    { id_feature: 11, name: "IPv6" },
    { id_feature: 12, name: "QoS" },
    { id_feature: 13, name: "Low Power" }
  ],
  byId: {
    1: { id_interface: 1, name: "Ethernet", description: "Standard RJ45", image: "ethernet.svg", features: [10, 12] },
    2: { id_interface: 2, name: "WiFi", description: "802.11ac", image: "wifi.svg", features: [10, 11] },
    3: { id_interface: 3, name: "UART", description: "TTL serial", image: "uart.svg", features: [] }
  }
};

function splitFeatures(all, attachedIds) {
  const attachedSet = new Set(attachedIds);
  const featuresAttached = all.filter(f => attachedSet.has(f.id_feature));
  const featuresAvailable = all.filter(f => !attachedSet.has(f.id_feature));
  return { featuresAttached, featuresAvailable };
}

const InterfacesAPI = {
  async getEditView(id_interface) {
    if (MOCK) {
      const interfaces = mockData.interfaces.slice().sort((a,b)=>a.name.localeCompare(b.name));
      if (!id_interface) {
        return {
          interfaces,
          interface: null,
          featuresAttached: [],
          featuresAvailable: mockData.features
        };
      }
      const entity = mockData.byId[id_interface];
      if (!entity) throw new Error("Not found");
      const { featuresAttached, featuresAvailable } = splitFeatures(mockData.features, entity.features);
      return {
        interfaces,
        interface: { id_interface: entity.id_interface, name: entity.name, description: entity.description, image: entity.image },
        featuresAttached,
        featuresAvailable
      };
    }

    // Real API (wire later)
    const url = id_interface ? `/api/interfaces/${encodeURIComponent(id_interface)}/edit-view`
                             : `/api/interfaces/edit-view`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load edit view (${res.status})`);
    return res.json();
  },

  async create(dto) {
    if (MOCK) {
      const id_interface = Math.max(0, ...mockData.interfaces.map(i=>i.id_interface)) + 1;
      mockData.interfaces.push({ id_interface, name: dto.name });
      mockData.byId[id_interface] = { id_interface, ...dto, features: dto.features || [] };
      return { id_interface, created: true };
    }
    const res = await fetch('/api/interfaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error(`Create failed (${res.status})`);
    return res.json();
  },

  async update(id_interface, dto) {
    if (MOCK) {
      const existing = mockData.byId[id_interface];
      if (!existing) throw new Error("Not found");
      mockData.byId[id_interface] = { ...existing, ...dto, features: dto.features || [] };
      const idx = mockData.interfaces.findIndex(i => i.id_interface === id_interface);
      if (idx >= 0) mockData.interfaces[idx].name = dto.name;
      return { id_interface, created: false };
    }
    const res = await fetch(`/api/interfaces/${encodeURIComponent(id_interface)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) throw new Error(`Update failed (${res.status})`);
    return res.json();
  }
};

export default InterfacesAPI;
