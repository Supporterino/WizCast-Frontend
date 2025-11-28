import { IconGoGame, IconHome, IconList, IconSettings } from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import classes from './NavBar.module.css';
import type { FunctionComponent } from 'react';
import { Route as HomeRoute } from '@/routes/index';
import { Route as GameRoute } from '@/routes/game/playing';
import { Route as ResultRoute } from '@/routes/results/overview';
import { Route as SettingsRoute } from '@/routes/settings';
import { useGame } from '@/hooks/useGame.tsx';

type SimpleNavbarProps = {
  closeNav: () => void;
};

export const NavBar: FunctionComponent<SimpleNavbarProps> = ({ closeNav }) => {
  const location = useLocation();
  const { startDate } = useGame();

  const data = [
    { link: HomeRoute.to, label: 'Home', icon: IconHome, disabled: startDate },
    { link: GameRoute.to, label: 'Game', icon: IconGoGame, disabled: !startDate },
    { link: ResultRoute.to, label: 'Results', icon: IconList, disabled: undefined },
  ];

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={classes.link}
      data-active={item.link === location.pathname || undefined}
      data-disabled={item.disabled}
      key={item.label}
      disabled={item.disabled as boolean}
      onClick={() => closeNav()}
    >
      <item.icon className={classes.linkIcon} />
      {item.label}
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <Link
          to={SettingsRoute.to}
          className={classes.link}
          data-active={SettingsRoute.to === location.pathname || undefined}
          key={'settings'}
          onClick={() => closeNav()}
        >
          <IconSettings className={classes.linkIcon} />
          Settings
        </Link>
      </div>
    </nav>
  );
};
