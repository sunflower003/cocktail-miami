import Header from './Header.jsx';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import ScrollUpButton from './ScrollUpButton.jsx';

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <ScrollUpButton />
      <Footer />
    </>
  );
};

export default Layout;
