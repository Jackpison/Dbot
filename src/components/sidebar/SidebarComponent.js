import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { useHistory } from 'react-router-dom';
import SLUGS from '../../resources/slugs';
import {
    IconAgents,
    IconArticles,
    IconContacts,
    IconIdeas,
    IconLogout,
    IconOverview,
    IconSettings,
    IconSubscription,
    IconTickets
} from '../../assets/icons';
import { convertSlugToUrl } from '../../resources/utilities';
import LogoComponent from './LogoComponent';
import Menu from './MenuComponent';
import MenuItem from './MenuItemComponent';

const useStyles = createUseStyles({
    separator: {
        borderTop: ({ theme }) => `1px solid ${theme.color.lightGrayishBlue}`,
        marginTop: 16,
        marginBottom: 16,
        opacity: 0.06
    }
});

function SidebarComponent() {
    const { push } = useHistory();
    const theme = useTheme();
    const classes = useStyles({ theme });
    const isMobile = window.innerWidth <= 1080;

    async function logout() {
        push(SLUGS.login);
    }

    function onClick(slug, parameters = {}) {
        push(convertSlugToUrl(slug, parameters));
    }

    return (
        <Menu isMobile={isMobile}>
            <div style={{ paddingTop: 30, paddingBottom: 30 }}>
                <LogoComponent />
            </div>
            <MenuItem
                id={SLUGS.dashboard}
                title='Dashboard'
                icon={IconOverview}
                onClick={() => onClick(SLUGS.dashboard)}
            />
            <MenuItem
                id={SLUGS.listingsniping}
                title='Listing Sniping'
                icon={IconTickets}
                onClick={() => onClick(SLUGS.listingsniping)}
            />
            <MenuItem
                id={SLUGS.liquiditysniping}
                title='Liquidity Sniping'
                icon={IconTickets}
                onClick={() => onClick(SLUGS.liquiditysniping)}
            />
            <MenuItem
                id={SLUGS.limitorderbuy}
                title='Limit Order Buy'
                icon={IconIdeas}
                onClick={() => onClick(SLUGS.limitorderbuy)}
            />
            <MenuItem
                id={SLUGS.limitordersell}
                title='Limit Order Sell'
                icon={IconIdeas}
                onClick={() => onClick(SLUGS.limitordersell)}
            />
            <MenuItem
                id={SLUGS.approve}
                title='Approve'
                icon={IconAgents}
                onClick={() => onClick(SLUGS.approve)}
            />
        </Menu>
    );
}

export default SidebarComponent;
