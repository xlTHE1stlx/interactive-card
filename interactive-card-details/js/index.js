function result(e, target, name) {
	const defaultValue = e.getAttribute("data-default");
	if (e.tagName === "INPUT") {
		e.value = Reflect.get(target, name) || defaultValue;
	}
	e.innerText = Reflect.get(target, name) || defaultValue;
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

function spanError(target, typeError) {
	console.log(target, typeError);
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
	let counter = 0;
	e.addEventListener("input", (event) => {
		console.log(name, event);
		if (e.getAttribute("name") === "numberCard") {
			counter++;
			if (counter === 4 && e.value.length < 18) {
				e.value += " ";
				counter = 0;
			}
			if (e.value.length === 0) counter = 0;
			console.log(counter);
			// if (e.value.match(/[a-zA-Z]/gm)) {
			// 	spanError(e, "string");
			// 	console.log(e.value.match(/[a-zA-Z]/gm));
			// }
		}
		if (e.getAttribute("name") === "yearCard" || e.getAttribute("name") === "monthCard") {
			if (e.value.length > 2) {
				spanError(e, "maximo");
			}
			console.log(e.value.length);
		}
		// proxy[name] = e.value;
		Reflect.set(proxy, name, e.value);
	});
});
