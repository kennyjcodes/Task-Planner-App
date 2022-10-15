import { useEffect, useContext, createContext, useReducer } from "react";
import axios from "axios";

// initial State:
const initialState = {
    user: null,
    fetchingUser: true,
    completeTodos: [],
    incompleteTodos: [],
};

// create a context:
export const GlobalContext = createContext(initialState);

// Reducer function:
const globalReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,
                user: action.payload,
                fetchingUser: false,
            };
        case "SET_COMPLETE_TODOS":
            return {
                ...state,
                completeTodos: action.payload,
            };
        case "SET_INCOMPLETE_TODOS":
            return {
                ...state,
                incompleteTodos: action.payload,
            };
        case "RESET_USER":
            return {
                ...state,
                user: null,
                completeTodos: [],
                incompleteTodos: [],
                fetchingUser: false,
            };
        default:
            return state;
    }
};

// Provider component:
export const GlobalProvider = (props) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        getCurrentUser();
    }, []);

    // ACTION: get current user
    const getCurrentUser = async () => {
        try {
            const res = await axios.get("/api/auth/current");
            if (res.data) {
                const todoRes = await axios.get("/api/todos/current");
                if (todoRes.data) {
                    dispatch({ type: "SET_USER", payload: res.data });
                    dispatch({ type: "SET_COMPLETE_TODOS", payload: todoRes.data.complete });
                    dispatch({ type: "SET_INCOMPLETE_TODOS", payload: todoRes.data.incomplete });
                }
            } else {
                dispatch({ type: "RESET_USER" });
            }
        } catch (error) {
            console.log(error);
            dispatch({ type: "RESET_USER" });
        }
    };

    // ACTION: logout user
    const logout = async () => {
        try {
            await axios.put("/api/auth/logout");
            dispatch({ type: "RESET_USER" });
        } catch (error) {
            console.log(error);
            dispatch({ type: "RESET_USER" });
        }
    };

    // ACTION: add Task
    const addTodo = (todo) => {
        try {
            dispatch({
                type: "SET_INCOMPLETE_TODOS",
                payload: [todo, ...state.incompleteTodos],
            });
        } catch (error) {
            console.log(error);
        }
    };

    // ACTION: remove Task
    const removeTodo = (todo) => {
        try {
            if (todo.complete) {
                dispatch({
                    type: "SET_COMPLETE_TODOS",
                    payload: state.completeTodos.filter((completeTodo) => {
                        return completeTodo._id !== todo._id;
                    }),
                });
            } else {
                dispatch({
                    type: "SET_INCOMPLETE_TODOS",
                    payload: state.incompleteTodos.filter((incompleteTodo) => {
                        return incompleteTodo._id !== todo._id;
                    }),
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ACTION: edit/update Task
    const updateTodo = (todo) => {
        try {
            if (todo.complete) {
                const newTodoComplete = state.completeTodos.map((completeTodo) => {
                    return completeTodo._id !== todo._id ? completeTodo : todo;
                });
                dispatch({
                    type: "SET_COMPLETE_TODOS",
                    payload: newTodoComplete,
                });
            } else {
                const newTodoIncomplete = state.incompleteTodos.map((incompleteTodo) => {
                    return incompleteTodo._id !== todo._id ? incompleteTodo : todo;
                });
                dispatch({
                    type: "SET_INCOMPLETE_TODOS",
                    payload: newTodoIncomplete,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const value = {
        ...state,
        getCurrentUser,
        logout,
        addTodo,
        todoComplete,
        todoInComplete,
        removeTodo,
        updateTodo,
    };

    return <GlobalContext.Provider value={value}>{props.children}</GlobalContext.Provider>;
};

export function useGlobalContext() {
    return useContext(GlobalContext);
}
