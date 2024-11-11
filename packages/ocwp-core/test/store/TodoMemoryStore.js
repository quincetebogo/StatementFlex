import { Store } from '../../src/Store.js';
import { v4 } from 'uuid';

class TodoMemoryStore extends Store {

	constructor() {

		super({
			name: `todo-store`,
			persistence: `memory`,
			trackStateHistory: true,
			logStateChanges: true
		});
	}

	add(todo) {

		todo.id = v4();

		const state = this.getState();

		if (state && state.todos) {
			this.setState({ todos: [...state.todos, todo] }, `TODO_ADD`);
		} else {
			this.setState({ todos: [todo] }, `TODO_ADD`);
		}
	}

	edit(todo) {

		const todos = this.getState().todos;
		const index = todos.findIndex(c => c.id === todo.id);

		if (index !== -1) {
			todos[index] = todo;
		}

		this.setState({ todos: todos }, `TODO_EDIT`);
	}

	deleteLast() {

		/** @type {Array} */
		const todos = this.getState().todos;
		todos.splice(todos.length - 1, 1);

		this.setState({ todos }, `TODOS_DELETE_LAST`);
	}

	get() {

		return this.getState().todos;
	}
}

export default new TodoMemoryStore();