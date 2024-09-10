// src/components/TodoTracker.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function TodoTracker() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchTasks = async () => {
      console.log('fetching')
      const user = auth.currentUser;

      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setTasks(tasksData);
      setLoading(false);
    };
   
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        //user loggedin
        fetchTasks();
      } else {
        // user logout
        navigate('/login');
      
      }
    });

    return () => unsubscribe();
  }, []);


  // Add task to Firestore
  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (user && taskInput.trim()) {
      try {
        const newTask = {
          title: taskInput,
          userId: user.uid,
          createdAt: new Date(),
        };
        await addDoc(collection(db, 'tasks'), newTask);
        setTasks(prevTasks => [...prevTasks, newTask]); 
        setTaskInput(''); 
      } catch (error) {
        console.error('Error adding task: ', error);
      }
    }
  };

  // Delete task from Firestore
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId)); 
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };


  if (loading) {
    return <div>Loading tasks...</div>;
  }
  console.log(tasks)

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h2>Your Tasks</h2>
      <div>
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      {tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.createdAt}>
              {task.title}
              <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks available. Start adding some!</p>
      )}
    </div>
  );
}

export default TodoTracker;