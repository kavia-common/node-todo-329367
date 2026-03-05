angular.module('todoController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Todos', function($scope, $http, Todos) {
		$scope.formData = {};
		$scope.loading = true;

		// Current filter: 'all' | 'active' | 'completed'
		$scope.filterState = 'all';

		// PUBLIC_INTERFACE
		$scope.setFilter = function(state) {
			/** Set the current UI filter (all/active/completed). */
			$scope.filterState = state;
		};

		// PUBLIC_INTERFACE
		$scope.todoMatchesFilter = function(todo) {
			/** Return true if a todo should be displayed under the current filter. */
			if ($scope.filterState === 'active') return !todo.done;
			if ($scope.filterState === 'completed') return !!todo.done;
			return true; // all
		};

		// GET =====================================================================
		// when landing on the page, get all todos and show them
		// use the service to get all the todos
		Todos.get()
			.success(function(data) {
				$scope.todos = data;
				$scope.loading = false;
			});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createTodo = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.text != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				Todos.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.todos = data; // assign our new list of todos
					});
			}
		};

		// UPDATE (toggle done) =====================================================
		// PUBLIC_INTERFACE
		$scope.toggleDone = function(todo) {
			/**
			 * Toggle completion status for a todo.
			 * Note: we update via API and reassign the returned list, matching existing patterns.
			 */
			$scope.loading = true;

			Todos.update(todo._id, { done: !todo.done })
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data;
				});
		};

		// DELETE ==================================================================
		// delete a todo (kept for backward compatibility; now triggered via a trash icon in UI)
		$scope.deleteTodo = function(id) {
			$scope.loading = true;

			Todos.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data; // assign our new list of todos
				});
		};
	}]);
