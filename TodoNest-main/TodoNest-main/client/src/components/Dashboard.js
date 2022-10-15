import { useEffect } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { useNavigate } from "react-router-dom";
import TodoCard from "./TodoCard";
import NewTodo from "./NewTodo";

const Dashboard = () => {
    const { user, completeTodos, incompleteTodos } = useGlobalContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="dashboard">
            <NewTodo />
            <div className="todos">
                <h1 className="todos__title">Incomplete Tasks</h1>
                {incompleteTodos.map((todo) => {
                    return <TodoCard todo={todo} key={todo._id} />;
                })}
            </div>
            {completeTodos.length > 0 && (
                <div className="todos">
                    <h1 className="todos__title">Completed Tasks</h1>
                    {completeTodos.map((todo) => {
                        return <TodoCard todo={todo} key={todo._id} />;
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
