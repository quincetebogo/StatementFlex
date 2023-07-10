export class Instana {

	static getInstance() {
		return this.instance || (this.instance = new Instana());
	}

	constructor() {

		if (this.instance) {
			return this.instance;
		}

	}


	 _instanaScript() {
		const body = document.body || document.getElementsByTagName(`body`)[0];
		const script = document.createElement(`script`);
		script.setAttribute(`defer`, ``);
		script.setAttribute(`crossorigin`, `anonymous`);
		script.setAttribute(`src`, `https://eum.instana.io/eum.min.js`);
		body.appendChild(script);
	  }
	
	  _instanaScripts(secContext, environmentKey) {
		const body = document.body || document.getElementsByTagName(`body`)[0];
		const script = document.createElement(`script`);
		script.innerHTML = `(function (s, t, a, n) { s[t] || (s[t] = a, n = s[a] = function () 
			{ n.q.push(arguments) }, n.q = [], n.v = 2, n.l = 1 * new Date) })(window, "InstanaEumObject", "ineum"); 
			ineum('reportingUrl', 'https://eum-green-saas.instana.io');
			ineum('key', '${environmentKey}');
			ineum('trackSessions');
			ineum('user', '${secContext.username}', '${secContext.fullName}', '${secContext.email}');
			ineum('page', '${window.location.pathname}');
			ineum('captureHeaders', [/./i]);
			ineum('wrapEventHandlers', true);
			ineum('wrapTimers', true);
			`;
		body.appendChild(script);
	  }

	  _instanaScriptsCustoms(secContext, pagename) {
		const body = document.body || document.getElementsByTagName(`body`)[0];
		const script = document.createElement(`script`);
		script.innerHTML = `(function (s, t, a, n) { s[t] || (s[t] = a, n = s[a] = function () 
			{ n.q.push(arguments) }, n.q = [], n.v = 2, n.l = 1 * new Date) })(window, "InstanaEumObject", "ineum"); 
			ineum('reportingUrl', 'https://eum-green-saas.instana.io');
			ineum('key', 'g7qULvtMSCGMWT4t8RGB8Q');
			ineum('trackSessions');
			ineum('user', '${secContext.username}', '${secContext.fullName}', '${secContext.email}');
			ineum('page', '${pagename}');
			ineum('captureHeaders', [/./i]);
			ineum('wrapEventHandlers', true);
			ineum('wrapTimers', true);
			`;
		body.appendChild(script);
	  }
	  
};