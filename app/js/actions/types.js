import { fetchAPI } from '../util/auth';


export const foundTypes = (typeList) => ({
    type: 'FOUND_TYPES',
    typeList
});


const memoizeSubtype = (results) => ({
    type: 'MEMOIZE_SUBTYPE',
    results
});

const missingTypes = (pluginName, actionType, action, types) => ({
    type: 'MISSING_TYPES',
    pluginName,
    actionType,
    action,
    types: types.map(({ type }) => type)
})


export const refreshValidation = () => {
    return (dispatch, getState) => {
        const {
            artifacts: { artifacts },
            plugins,
            superTypes: { yes }
        } = getState();
        plugins.forEach(plugin => {
            plugin.methods.forEach(method => {
                dispatch(missingTypes(plugin.name, 'methods', method,
                                      method.inputs.filter(input =>
                                          !artifacts.find(({ type }) => (console.log(input.type), yes[input.type].has(type))))))
            })
            plugin.visualizers.forEach(visualizer => {
                dispatch(missingTypes(plugin.name, 'visualizers', visualizer,
                                      visualizer.inputs.filter(input =>
                                          !artifacts.find(({ type }) => (console.log(input.type), yes[input.type].has(type))))))
            })
        })
    }
}


export const checkTypes = () => {
    return (dispatch, getState) => {
        const {
            artifacts: { artifacts },
            connection: { uri, secretKey },
            superTypes: { knownTypes }
        } = getState();
        const artifactTypes = artifacts.map(({ type }) => type);
        const url = `http://${uri}/api/types/subtype`;
        const body = {
            a: artifactTypes,
            b: Array.from(knownTypes)
        };
        // TODO: don't hit the server if there is nothing new to ask...
        fetchAPI(secretKey, 'POST', url, body)
        .then(json => dispatch(memoizeSubtype(json)))
        .then(() => dispatch(refreshValidation()))
    };
};
