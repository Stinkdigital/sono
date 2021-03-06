import AbstractEffect from './abstract-effect';
import isSafeNumber from '../core/utils/isSafeNumber';
import sono from '../core/sono';

// up-sample before applying curve for better resolution result 'none', '2x' or '4x'
// oversample: '2x'
// oversample: '4x'

class Distortion extends AbstractEffect {
    constructor({level = 1, samples = 22050, oversample = 'none', wet = 1, dry = 0} = {}) {
        super(sono.context.createWaveShaper(), null, false);

        this._node.oversample = oversample || 'none';

        this._samples = samples || 22050;

        this._curve = new Float32Array(this._samples);

        this._level;

        this._enabled = false;

        this.wet = wet;
        this.dry = dry;
        this.update({level});
    }

    update({level}) {
        if (level === this._level || !isSafeNumber(level)) {
            return;
        }

        this.enable(level > 0);

        if (!this._enabled) {
            return;
        }

        const k = level * 100;
        const deg = Math.PI / 180;
        const y = 2 / this._samples;

        let x;
        for (let i = 0; i < this._samples; ++i) {
            x = i * y - 1;
            this._curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }

        this._level = level;
        this._node.curve = this._curve;
    }

    get level() {
        return this._level;
    }

    set level(level) {
        this.update({level});
    }
}

export default sono.register('distortion', opts => new Distortion(opts));
