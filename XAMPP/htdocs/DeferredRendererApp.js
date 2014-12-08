
requirejs.config(
{
 
    baseUrl: '',
  
    paths: {

        CBEngine : 'scripts/modules/CBEngine',
        CBRenderer : 'scripts/modules/CBRenderer',
        InputManager : 'scripts/modules/InputManager',
        CBStorage : 'scripts/modules/CBStorage',
        Mesh: 'scripts/modules/Mesh',
        Material: 'scripts/modules/Material',
        Texture: 'scripts/modules/Texture',
        GBuffer: 'scripts/modules/GBuffer',
        LBuffer: 'scripts/modules/LBuffer',
        PointLight : 'scripts/modules/PointLight',
        PostRenderScene: 'scripts/modules/PostRenderScene',
        ShaderManager: 'scripts/modules/ShaderManager',
        MatrixStack: 'scripts/modules/MatrixStack',

        Actor: 'scripts/modules/Actor',
        GameWorld: 'scripts/modules/GameWorld',
        Camera: "scripts/modules/Camera",

        // Helper file to lump all math functionality into a single include
        MathUtil: 'scripts/modules/MathUtil',
        
        // Math Structures
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

        // Data Structures
        Collections: "scripts/lib/collections/collections.min",
        Buckets: "scripts/lib/Buckets/Buckets",

        // Other External Javascript Libraries
        JQuery: "scripts/lib/JQuery/jquery-2.1.1",

        Reference: "scripts/modules/Reference",
    }
});


require( [ "CBEngine" ], function( CBEngine )
{

});


/*
require( [ "Reference" ], function( CBEngine )
{

});
*/











