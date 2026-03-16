import { Navigate } from "react-dom"

const privateRoute = ({ Childrem }) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      return <Navigate to="/login" />;
    }
  
    return children;
  };
  
  export default PrivateRout
