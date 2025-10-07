import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return (
    <LoginForm 
      onLogin={(username, password, role) => {
        console.log(`Login: ${role} - ${username}`);
      }} 
    />
  );
}