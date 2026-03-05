angular.module('todoController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Todos', function($scope, $http, Todos) {
		$scope.formData = {};
		$scope.loading = true;

		// Current filter: 'all' | 'active' | 'completed'
		$scope.filterState = 'all';

		// Edit state (single active edit at a time to keep UI simple and predictable)
		$scope.editingTodoId = null;
		$scope.editTextDraft = '';

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

		// EDIT TEXT FLOW ==========================================================
		// PUBLIC_INTERFACE
		$scope.startEditTodo = function(todo) {
			/**
			 * Enter edit mode for a todo.
			 * Contract:
			 * - Inputs: todo object with {_id, text}
			 * - Side effects: updates controller edit state only
			 */
			$scope.editingTodoId = todo._id;
			$scope.editTextDraft = todo.text || '';
		};

		// PUBLIC_INTERFACE
		$scope.cancelEditTodo = function() {
			/**
			 * Exit edit mode without persisting changes.
			 */
			$scope.editingTodoId = null;
			$scope.editTextDraft = '';
		};

		// PUBLIC_INTERFACE
		$scope.saveEditTodo = function(todo) {
			/**
			 * Persist edited text for a todo.
			 * Flow name: EditTodoTextFlow
			 *
			 * Contract:
			 * - Inputs: todo object with {_id, text}; uses $scope.editTextDraft as the proposed new text
			 * - Validation: trimmed text must be non-empty; if unchanged, no API call is made
			 * - Side effects: PUT to API; refreshes $scope.todos from returned data; exits edit mode on success
			 * - Errors: surfaced via console for debuggability; loading spinner is reset
			 */
			var trimmed = ($scope.editTextDraft || '').trim();
			if (!trimmed) {
				// Keep behavior simple: disallow empty edits.
				return;
			}

			// No-op if unchanged.
			if (trimmed === (todo.text || '')) {
				return $scope.cancelEditTodo();
			}

			$scope.loading = true;
			Todos.editTodoText(todo._id, trimmed)
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data;
					$scope.cancelEditTodo();
				})
				.error(function(err) {
					$scope.loading = false;
					// Provide context to debug API failures without swallowing the error.
					console.error('EditTodoTextFlow failed for todo_id=' + todo._id, err);
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
