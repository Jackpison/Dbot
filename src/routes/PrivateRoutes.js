import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import SLUGS from '../resources/slugs';
import LoadingComponent from '../components/loading';

const DashboardComponent = lazy(() => import('./dashboard'));
const ApproveComponent = lazy(() => import('./approve'));
const ListingSnipingComponent = lazy(() => import('./listingsniping'));
const LiquiditySnipingComponent = lazy(() => import('./liquiditysniping'));
const LimitOrderBuyComponent = lazy(() => import('./limitorderbuy'));
const LimitOrderSellComponent = lazy(() => import('./limitordersell'));

function PrivateRoutes() {
    return (
        <Suspense fallback={<LoadingComponent loading />}>
            <Switch>
                <Route exact path={SLUGS.dashboard} component={DashboardComponent} />
                <Route exact path={SLUGS.listingsniping} component={ListingSnipingComponent} />
                <Route exact path={SLUGS.liquiditysniping} component={LiquiditySnipingComponent} />
                <Route exact path={SLUGS.limitorderbuy} component={LimitOrderBuyComponent} />
                <Route exact path={SLUGS.limitordersell} component={LimitOrderSellComponent} />
                <Route exact path={SLUGS.approve} component={ApproveComponent} />
                <Redirect to={SLUGS.dashboard} />
            </Switch>
        </Suspense>
    );
}

export default PrivateRoutes;
