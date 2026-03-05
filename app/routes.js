var Todo = require('./models/todo');

function getTodos(res) {
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(todos); // return all todos in JSON format
    });
};

// PUBLIC_INTERFACE
function coerceOptionalBoolean(value) {
    /**
     * Coerce incoming values into a boolean when they are provided.
     * Returns `undefined` when the value is not present, so callers can decide whether to update.
     */
    if (value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }
    return Boolean(value);
};

module.exports = function (app) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function (req, res) {
        // use mongoose to get all todos in the database
        getTodos(res);
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function (req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text: req.body.text,
            done: false
        }, function (err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            getTodos(res);
        });

    });

    // update a todo (supports toggling done and/or editing text)
    app.put('/api/todos/:todo_id', function (req, res) {
        var update = {};

        if (req.body && req.body.text !== undefined) {
            update.text = req.body.text;
        }

        var done = req.body ? coerceOptionalBoolean(req.body.done) : undefined;
        if (done !== undefined) {
            update.done = done;
        }

        // If nothing to update, just return the list to keep behavior predictable for the UI.
        if (Object.keys(update).length === 0) {
            return getTodos(res);
        }

        Todo.findByIdAndUpdate(
            req.params.todo_id,
            update,
            { new: true },
            function (err, todo) {
                if (err) {
                    return res.send(err);
                }

                // return all todos for existing frontend pattern
                getTodos(res);
            }
        );
    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function (err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
