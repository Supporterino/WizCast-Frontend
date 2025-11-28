import { IconGoGame, IconHome, IconList } from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import classes from './NavBar.module.css';
import type { FunctionComponent } from 'react';
import { Route as HomeRoute } from '@/routes/index';
import { Route as GameRoute } from '@/routes/game/playing';
import { Route as ResultRoute } from '@/routes/results/overview';

type SimpleNavbarProps = {
  closeNav: () => void;
};

export const NavBar: FunctionComponent<SimpleNavbarProps> = ({ closeNav }) => {
  const location = useLocation();

  const data = [
    { link: HomeRoute.to, label: 'Home', icon: IconHome },
    { link: GameRoute.to, label: 'Game', icon: IconGoGame },
    { link: ResultRoute.to, label: 'Results', icon: IconList },
  ];

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={classes.link}
      data-active={item.link === location.pathname || undefined}
      key={item.label}
      onClick={() => closeNav()}
    >
      <item.icon className={classes.linkIcon} />
      {item.label}
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}></div>
    </nav>
  );
};
