
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        MathUtil: 'scripts/modules/MathUtil',
        GameWorld: 'scripts/modules/GameWorld',
        GLMatrix: 'scripts/lib/gl-matrix/gl-matrix',
        GLCommon: "scripts/lib/gl-matrix/common",
        Vector2: "scripts/lib/gl-matrix/vec2",
        Vector3: "scripts/lib/gl-matrix/vec3",
        Vector4: "scripts/lib/gl-matrix/vec4",
        Matrix2: "scripts/lib/gl-matrix/mat2",
        Matrix2D: "scripts/lib/gl-matrix/mat2d",
        Matrix3: "scripts/lib/gl-matrix/mat3",
        Matrix4: "scripts/lib/gl-matrix/mat4",
        Quaternion: "scripts/lib/gl-matrix/quat",
    }
});


require(["GameWorld"], function( GameWorld )
{

});

/*
require(["scripts/Util/MathUtil"], function( MathUtil )
{

});
*/



/*


require(["scripts/modules/TestObject"], function( TestObject )
{

});


*/









