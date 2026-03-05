angular.module('todoService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Todos', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/todos');
			},
			create : function(todoData) {
				return $http.post('/api/todos', todoData);
			},
			update : function(id, todoData) {
				return $http.put('/api/todos/' + id, todoData);
			},
			// PUBLIC_INTERFACE
			editTodoText : function(id, newText) {
				/**
				 * Update a todo's text.
				 * Contract:
				 * - Inputs: (id: string, newText: string)
				 * - Side effects: PUT /api/todos/:todo_id with { text }
				 * - Output: promise resolving to the refreshed todo list (existing backend pattern)
				 */
				return $http.put('/api/todos/' + id, { text: newText });
			},
			delete : function(id) {
				return $http.delete('/api/todos/' + id);
			}
		}
	}]);
