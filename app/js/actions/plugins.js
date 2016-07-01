import { fetchAPI } from '../util/auth';
import actions from './';

const foundPlugin = (plugin) => ({
    type: 'FOUND_PLUGIN',
    plugin
});

const foundMethod = (plugin, method) => ({
    type: 'FOUND_METHOD',
    plugin,
    method
})

const foundVisualizer = (plugin, visualizer) => ({
    type: 'FOUND_VISUALIZER',
    plugin,
    visualizer
})

export const loadVisualizers = (name, endpoint) => {
    return (dispatch, getState) => {
        const { plugins, connection: { uri, secretKey } } = getState();
        const url = `http://${uri}${endpoint}`
        fetchAPI(secretKey, 'GET', url)
            .then(({ visualizers }) => Object.keys(visualizers).forEach(
                key => {
                    dispatch(foundVisualizer(name, visualizers[key]))
                    dispatch(actions.foundTypes(
                        visualizers[key].inputs.map(input => input.type)));
                }));
    }
}

export const loadMethods = (name, endpoint) => {
    return (dispatch, getState) => {
        const { plugins, connection: { uri, secretKey } } = getState();
        const url = `http://${uri}${endpoint}`
        fetchAPI(secretKey, 'GET', url)
            .then(({ methods }) => Object.keys(methods).forEach(
                key => {
                    dispatch(foundMethod(name, methods[key]));
                    dispatch(actions.foundTypes(
                        methods[key].inputs.map(input => input.type)));
                }));
    };
}

export const loadPlugins = () => {
    return (dispatch, getState) => {
        const { connection: { uri, secretKey } } = getState();
        const url = `http://${uri}/api/plugins/`;
        const method = 'GET';
        fetchAPI(secretKey, method, url)
        .then( json => json.plugins.map(plugin => {
            const x = dispatch(foundPlugin(plugin));
            return x
        }))
        .then( actions => actions.map(({ plugin: { name, methodsURI, visualizersURI }}) => {
            dispatch(loadMethods(name, methodsURI));
            dispatch(loadVisualizers(name, visualizersURI));
        }));
    }
};
