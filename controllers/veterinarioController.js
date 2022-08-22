import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarToken from "../helpers/generarToken.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    try {

        const {email, nombre} = req.body;

        //prevenir usuarios duplicados
        const existeUsuario = await Veterinario.findOne({email});

        if(existeUsuario){
            const error = new Error('Usuario ya Registrado');
            return res.status(400).json({msg: error.message})
        }

        //Guardar un Nuevo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        //Enviar el Email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error);
    }
    
};

const confirmar = async (req, res) => {

    const {token} = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    if(!usuarioConfirmar){
        const error = new Error('Token No Válido');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg: "Cuenta Confirmada Correctamente"});

    } catch (error) {
        console.log(error);
    }
    
};

const autenticar = async (req, res) => {

    const {email, password} = req.body;

    //comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    if(!usuario){
        const error = new Error('El Usuario No Existe');
        return res.status(404).json({msg: error.message});
    }

    //comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu Cuenta no ha sido Confirmada');
        return res.status(403).json({msg: error.message});
    }

    //Revisar el password
    if(await usuario.comprobarPassword(password)){

        //Autenticar al Usuario
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        });

    }else{
        const error = new Error('La Contraseña es Incorrecta');
        return res.status(403).json({msg: error.message});
    }


};

const olvidePassword = async (req, res) => {

    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if(!existeVeterinario){

        const error = new Error('Usuario No Existe');
        return res.status(400).json({msg: error.message});

    }

    try {

        existeVeterinario.token = generarToken();
        await existeVeterinario.save();

        //Enviar email con instrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        });

        res.json({msg: 'Hemos enviado un email con las Instrucciones'});
        
    } catch (error) {
        console.log(error);
    }

};

const comprobarToken = async (req, res) => {

    const { token } = req.params;
    console.log(token);

    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido){

        res.json({msg: 'Token Válido y el Usuario Existe'});

    }else{

        const error = new Error('Token No Válido');
        return res.status(400).json({msg: error.message});

    }

};

const nuevoPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});

    if(!veterinario){

        const error = new Error('Hubo un Error');
        return res.status(400).json({msg: error.message});

    }

    try {

        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: 'Password Modificado Correctamente'});
        
    } catch (error) {
        console.log(error);
    }

};

const perfil = (req, res) => {

    const { veterinario } = req;

    res.json( veterinario );
};

const actualizarPerfil = async (req, res) => {

    const veterinario = await Veterinario.findById(req.params.id);
    const {email} = req.body;

    if(!veterinario){

        const error = new Error('Hubo un Error');
        return res.status(400).json({msg: error.message});
        
    }

    if(veterinario.email !== req.body.email){

        const existeEmail = await Veterinario.findOne({email});
        if(existeEmail){

            const error = new Error('Email en uso');
            return res.status(400).json({msg: error.message});

        }

    }

    try {

        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
        
    } catch (error) {
        console.log(error);
    }

}

const actualizarPassword = async (req, res) => {

    //leer los datos
    const {id} = req.veterinario;
    const {pwd_actual, pwd_nuevo} = req.body;

    //comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if(!veterinario){

        const error = new Error('Hubo un Error');
        return res.status(400).json({msg: error.message});
        
    }

    //comprobar el password actual
    if(await veterinario.comprobarPassword(pwd_actual)){

        //almacenar el nuevo password
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg: 'Password Modificado Correctamente'});

    }else{

        const error = new Error('Password Actual No Coincide');
        return res.status(400).json({msg: error.message});

    }    

}

export {
    registrar,     
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
    actualizarPerfil,
    actualizarPassword
};