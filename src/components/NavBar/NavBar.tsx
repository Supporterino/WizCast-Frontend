import { IconGoGame, IconHome, IconList, IconPlus, IconSettings } from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import classes from './NavBar.module.css';
import type { FunctionComponent } from 'react';
import { Route as HomeRoute } from '@/routes/index';
import { Route as NewRoute } from '@/routes/game/new';
import { Route as GameRoute } from '@/routes/game/playing';
import { Route as ResultRoute } from '@/routes/results/overview';
import { Route as SettingsRoute } from '@/routes/settings';
import { useGame } from '@/hooks/useGame.tsx';

type SimpleNavbarProps = {
  closeNav: () => void;
};

export const NavBar: FunctionComponent<SimpleNavbarProps> = ({ closeNav }) => {
  const location = useLocation();
  const { active } = useGame();

  const { t } = useTranslation();

  const data = [
    {
      link: HomeRoute.to,
      label: t('nav.home'),
      icon: IconHome,
      disabled: undefined,
    },
    {
      link: NewRoute.to,
      label: t('nav.new'),
      icon: IconPlus,
      disabled: active,
    },
    {
      link: GameRoute.to,
      label: t('nav.game'),
      icon: IconGoGame,
      disabled: !active,
    },
    {
      link: ResultRoute.to,
      label: t('nav.results'),
      icon: IconList,
      disabled: undefined,
    },
  ];

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={classes.link}
      data-active={item.link === location.pathname || undefined}
      // data-disabled={item.disabled ?? undefined}
      key={item.label}
      disabled={item.disabled}
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
          key="settings"
          onClick={() => closeNav()}
        >
          <IconSettings className={classes.linkIcon} />
          {t('nav.settings')}
        </Link>
      </div>
    </nav>
  );
};
