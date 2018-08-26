class Vector {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	copy() {
		return new Vector(this.x, this.y, this.z);
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	normalize() {
		let magnitude = this.magnitude();
		return new Vector(this.x / magnitude, this.y / magnitude, this.z / magnitude);
	}

	static add(v1, v2) {
		return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
	}

	static subtract(v1, v2) {
		return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
	}

	static multiply(v, k) {
		return new Vector(v.x * k, v.y * k, v.z * k);
	}

	static divide(v, k) {
		return new Vector(v.x / k, v.y / k, v.z / k);
	}

	static dotProduct(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	}

	static crossProduct(v1, v2) {
		//AxB = (AyBz − AzBy, AzBx − AxBz, AxBy − AyBx)
		return new Vector(v1.y*v2.z - v1.z*v2.y, v1.z*v2.x - v1.x*v2.z, v1.x*v2.y - v1.y*v2.x);
	}

	static reflect(d, n) {
		return Vector.subtract(d, Vector.multiply(n, 2 * Vector.dotProduct(d, n)));
	}
}