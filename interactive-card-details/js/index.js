function result(e, target, name) {
	if (e.tagName === "INPUT") {
		e.value = Reflect.get(target, name);
	}
	// console.log(target, name);
	e.innerText = Reflect.get(target, name);
}

function base(e, target, name) {
	e.value = Reflect.get(target, name);
}

function track(target, name) {
	if (!deps.has(name)) {
		const effect = () =>
			document
				.querySelectorAll(`*[connection=${name}]`)
				.forEach((e) => result(e, target, name));
		deps.set(name, effect);
	}
}

function trigger(name) {
	const effect = deps.get(name);
	effect();
}

const self = this;

const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
	e.preventDefault();
});

const origin = {
	name: "",
	cardNumber: "",
	month: "",
	year: "",
	cvc: ""
};

const proxy = new Proxy(origin, {
	get(target, name) {
		if (Reflect.has(target, name)) {
			self.track(target, name);
			return Reflect.get(target, name);
		}
		console.warn(`The property ${name} don't exist`);
		return "";
	},
	set(target, name, newValue) {
		Reflect.set(target, name, newValue);
		self.trigger(name);
	}
});

const deps = new Map();

const value = document.querySelectorAll("*[connection]").forEach((e) => {
	result(e, proxy, e.getAttribute("connection"));
});

const model = document.querySelectorAll("*[model]").forEach((e) => {
	const name = e.getAttribute("model");
	base(e, proxy, name);
	// console.log(e);
	// let counter = 0;
	e.addEventListener("input", () => {
		if (e.getAttribute("inputmode")) {
			if (counter === 3 && e.value.length < 20) {
				e.value += " ";
				counter = 0;
			} else if (counter < 3 && e.value.length < 19) {
				e.value;
				counter++;
			}
			console.log(e.value.length);
		}
		Reflect.set(proxy, name, e.value);
	});
});
