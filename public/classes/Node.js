class SOSMNode {
  constructor() {
    this.type = undefined;

    this.image = 'tba.svg';
    this.name = '';
    this.description = '';
    this.features = [];   // array of numeric feature IDs (where relevant)
    this.qtyInYears = []; // for Subsystem quantities per year (optional UI use)

    this.err = [];
  }

  // ---------- Validation ----------
  checkData() {
    let ok = true;
    this.err = [];

    const name = (this.name ?? '').toString().trim();
    const image = (this.image ?? '').toString().trim();

    if (this.type === 'Subsystem') {
      if (!name)  { ok = false; this.err.push({ err: 'No name provided.' }); }
      if (!image) { ok = false; this.err.push({ err: 'No image provided.' }); }
      if (this.quantity === undefined || this.quantity === null || this.quantity === '') {
        ok = false; this.err.push({ err: 'No quantity provided.' });
      }
    }

    if (this.type === 'Interface') {
      if (!name)  { ok = false; this.err.push({ err: 'No name provided.' }); }
      if (!image) { ok = false; this.err.push({ err: 'No image provided.' }); }
    }

    if (this.type === 'Network') {
      if (!name)  { ok = false; this.err.push({ err: 'No name provided.' }); }
      if (!image) { ok = false; this.err.push({ err: 'No image provided.' }); }
    }

    if (this.type === 'Feature') {
      if (!name)  { ok = false; this.err.push({ err: 'No name provided.' }); }
    }

    return ok;
  }

  getValidationErrors() {
    return this.err;
  }

  // ---------- Simple setters ----------
  setDescription(desc) {
    this.description = desc ? String(desc) : '';
  }
  setName(name) {
    this.name = name ? String(name) : '';
  }

  // ---------- Utilities ----------
  static _toIntArray(maybeArrOrCsv) {
    if (Array.isArray(maybeArrOrCsv)) {
      return maybeArrOrCsv
        .map(v => Number.parseInt(v, 10))
        .filter(n => Number.isFinite(n));
    }
    if (typeof maybeArrOrCsv === 'string' && maybeArrOrCsv.length) {
      return maybeArrOrCsv
        .split(',')
        .map(s => Number.parseInt(s.trim(), 10))
        .filter(n => Number.isFinite(n));
    }
    return [];
  }

  // ---------- Load details from server object ----------
  /**
   * @description Load the details into this Node object
   * @param {Object} node - server-provided object
   */
  update(node) {
    this.type = node.type;

    const standardSet = () => {
      this.name = node.name ?? '';
      this.image = node.image ?? 'tba.svg';
      this.description = node.description ?? '';
    };

    if (node.type === 'Subsystem') {
      standardSet();
      this.id_subsystem = node.id_subsystem;
      this.isJoint = node.isJoint;
      this.quantity = node.quantity ?? this.quantity;
      this.qtyInYears = Array.isArray(node.qtyInYears) ? node.qtyInYears : (this.qtyInYears || []);
    }

    if (node.type === 'Interface') {
      standardSet();
      this.id_interface = node.id_interface;
      this.features = Node._toIntArray(node.features);
    }

    if (node.type === 'SubsystemInterface') {
      // Note: server provides a flattened view for SI map
      this.name = node.interfaceName ?? '';
      this.image = node.interfaceImage ?? 'tba.svg';
      this.description = node.description ?? '';
      this.id_SIMap = node.id_SIMap;

      this.subsystemName = node.subsystemName;
      this.subsystemImage = node.subsystemImage;

      this.id_interface = node.id_interface;
      this.id_subsystem = node.id_subsystem;

      this.features = Node._toIntArray(node.features);
    }

    if (node.type === 'Network') {
      standardSet();
      this.id_network = node.id_network;
      this.id_feature = node.id_feature;   // a single feature ID the network implements (if provided)
      this.featureName = node.featureName; // human-readable label (if provided)
    }
  }

  // ---------- Prepare payload for server ----------
  /**
   * @description Returns the Node payload for transfer to the server
   */
  submitToServer() {
    const data = {
      type: this.type,
      name: this.name,
      description: this.description
    };

    if (this.type === 'Subsystem') {
      if (this.id_subsystem) data.id_subsystem = this.id_subsystem; // update vs insert
      data.quantity = this.quantity;
      data.image = this.image;
      data.isJoint = this.isJoint;
      data.qtyInYears = this.qtyInYears;
    }

    if (this.type === 'Interface') {
      if (this.id_interface) data.id_interface = this.id_interface;
      data.image = this.image;
      data.features = Array.isArray(this.features) ? this.features : [];
    }

    if (this.type === 'Network') {
      if (this.id_network) data.id_network = this.id_network;
      data.image = this.image; // FIX: was this.node.image
      // prefer explicit id_feature if set; otherwise take first from features[]
      const firstFeature = Array.isArray(this.features) && this.features.length ? this.features[0] : undefined;
      data.id_feature = this.id_feature ?? firstFeature;
    }

    if (this.type === 'Feature') {
      // (no extra fields currently)
    }

    return data;
  }

  // ---------- For details table ----------
  /**
   * @description Returns an array of {label, value?} for the selected node details UI
   */
  getNodeDetails() {
    const rows = [];

    if (this.type === 'Subsystem') {
      rows.push(
        { label: 'Subsystem Name', value: this.name },
        { label: 'Quantities' },
        { label: 'Description', value: this.description }
      );
    }

    if (this.type === 'SubsystemInterface') {
      rows.push(
        { label: 'Interface Name', value: this.name },
        { label: 'Installed In', value: this.subsystemName },
        { label: 'Interface Lifespan' },
        { label: 'Description', value: this.description }
      );
    }

    if (this.type === 'Network') {
      rows.push(
        { label: 'Network Name', value: this.name },
        { label: 'Node Type', value: this.type },
        { label: 'Implemented Feature', value: this.featureName },
        { label: 'Description', value: this.description }
      );
    }

    return rows;
  }
}
