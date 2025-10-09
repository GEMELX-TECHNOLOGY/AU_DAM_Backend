import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";
import { error } from "console";
import { access } from 'fs';
import { userInfo } from 'os';

//Ayuda al filtrado del front =)
export const get_products = async (req: Request, res: Response) => {
  try {
    const { product_id, tipo_id, marca, modelo, precio_unitario, proveedor_id, estado_id } = req.query;

    const where: any = {};

    if (tipo_id) where.tipo_id = Number(tipo_id);
    if (product_id) where.product_id = Number(product_id);
    if (marca) where.marca = { contains: marca as string, mode: "insensitive" };
    if (modelo) where.modelo = { contains: modelo as string, mode: "insensitive" };
    if (precio_unitario) where.precio_unitario = Number(precio_unitario);
    if (proveedor_id) where.proveedor_id = Number(proveedor_id);
    if (estado_id) where.estado_id = Number(estado_id);

    const products = await prisma.producto.findMany({
      where,
      include: { tipo: true, estado: true, proveedor: true }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

//get por id de producto

export const get_product_id = async (req:Request, res:Response)=>{
    const {producto_id}= req.params;
    const id = Number(producto_id);


    if(isNaN(id)){
        return res.status(400).json({success:false, message: "ID de producto invalido"});
    }
    
    try{
        const producto = await prisma.producto.findUnique({
            where: {producto_id:id},
            include:{
                proveedor:true,
                estado:true,
                tipo:true
            }
            
        })
        if (!producto){
            return res.status(404).json({sucess:false,message: "Producto no encontrado"});
        }
        return res.json({success:true, data:producto});
    }catch(error){
        console.error("Error al mostrar producto",error)
        res.status(500).json({success:false, error})
    }

}

export const create_product =async (req:Request, res:Response) =>{
    const {
        tipo_id,
        marca,
        modelo,
        especificacion,
        imagen_url,
        precio_unitario,
        stock_actual,
        proveedor_id,
        fecha_ultima_compra,
        estado_id
    }= req.body;
    
    if(!tipo_id || !marca || !modelo ||!precio_unitario ||!proveedor_id||!estado_id){
        return res.status(400).json({success:false, message:"faltan campos obligatorios"})
    };

    try{
        const newProduct = await prisma.producto.create({
            data:{
                tipo_id:Number(tipo_id),
                marca,
                modelo,
                especificacion,imagen_url,
                precio_unitario:Number(precio_unitario),
                stock_actual:Number(stock_actual),
                proveedor_id:Number(proveedor_id),
                fecha_ultima_compra: new Date(fecha_ultima_compra),
                estado_id:Number(estado_id),
                
            },
            include:{
                tipo:true,
                estado:true,
                proveedor:true
            }
        });

        await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion:"CREATE",
                entidad:"Producto",
                entidad_id:newProduct.producto_id,
                descripcion:`el usuario ${req.user?.usuario_id} creo el producto ${newProduct.marca} ${newProduct.modelo}`
            }
        });

        return res.status(201).json({
            success:true,
            data: newProduct
        })
    }catch(error){
        console.error("Error al crear el producto",error)
        return res.status(500).json({success:false, error})
    }
}
// Activar o desactivar un producto
export const put_estado = async (req: Request, res: Response) => {
  try {
    const usuario = req.user;

    
    if (usuario?.rol_id !== 1) {
      return res.status(403).json({
        success: false,
        message: "Solo el administrador puede cambiar el estado del producto"
      });
    }

    const { id } = req.params;
    const producto_id = Number(id);
    if (isNaN(producto_id)) {
      return res.status(400).json({
        success: false,
        message: "ID de producto inválido"
      });
    }

    const { estado_id } = req.body;
    if (!estado_id) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionarse el estado_id"
      });
    }

    
    const producto = await prisma.producto.findUnique({
      where: { producto_id }
    });
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }


    const updateProduct = await prisma.producto.update({
      where: { producto_id },
      data: { estado_id: Number(estado_id) },
      include: { tipo: true, proveedor: true, estado: true }
    });


    await prisma.bitacora.create({
      data: {
        usuario_id: usuario.usuario_id,
        accion: "UPDATE_ESTADO",
        entidad: "Producto",
        entidad_id: producto_id,
        descripcion: `El usuario ${usuario.usuario_id} cambió el estado del producto ${updateProduct.marca} ${updateProduct.modelo} a ${estado_id == 1 ? "ACTIVO" : "INACTIVO"}`
      }
    });

 
    return res.status(200).json({
      success: true,
      message: "Estado del producto actualizado correctamente",
      data: updateProduct
    });

  } catch (error) {
    console.error("Error al actualizar el estado del producto:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};


//actualizar prorducto
export const put_producto = async (req:Request, res:Response)=>{

    try{ 
        const usuario = req.user;

        if (usuario?.rol_id !==1){

            return res.status(403).json({
                success: false,
                message: "Solo el administrador puede cambiar los datos del producto"
            });
        };

        const {id}= req.params;
        const producto_id = Number(id);
        if (isNaN(producto_id)){
            return res.status(404).json({
                success: false,
                message:"ID de producto invalido"
            })
        };

  
     const allowedFields = ["marca", "modelo", "especificacion", "imagen_url", "proveedor_id"];
     const bodyFields = Object.keys(req.body);

   
        const invalidFields = bodyFields.filter((field) => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return res.status(400).json({
         success: false,
         message: `Los siguientes campos no se pueden actualizar: ${invalidFields.join(
           ", "
         )}. Solo se permiten: ${allowedFields.join(", ")}.`,
         });
         }
        const {marca, modelo, especificacion, imagen_url, proveedor_id}= req.body;
        const dataToUpdate: any ={};
        if (marca!==undefined)dataToUpdate.marca=marca;
        if (modelo!==undefined)dataToUpdate.modelo=modelo;
        if(especificacion!==undefined)dataToUpdate.especificacion=especificacion;
        if(imagen_url!==undefined)dataToUpdate.imagen_url=imagen_url;
        if (proveedor_id !== undefined) dataToUpdate.proveedor_id = Number(proveedor_id);
        if (Object.keys(dataToUpdate).length === 0) {
         return res.status(400).json({
             success: false,
             message: "Debe enviar al menos un campo válido para actualizar"
        });
}

        const productUpdate = await prisma.producto.update({
            where:{
                producto_id
            },
            select:{
                producto_id:true,
                marca:true,
                modelo:true,
                especificacion:true,
                imagen_url:true,
                proveedor_id:true
            },
            data:dataToUpdate,
        });

        await prisma.bitacora.create({
            data:{
                usuario_id:req.user?.usuario_id || 1,
                accion:"UPDATE",
                entidad:"Producto",
                entidad_id: productUpdate.producto_id,
                descripcion: `el usuario ${req.user?.usuario_id} actualizo el producto ${productUpdate.marca} ${productUpdate.modelo}`
            }
            
        });

        return res.json({success:true, data:productUpdate});
    }catch(error){
        console.error("Error al actualizar producto")
        return res.status(506).json({success:false,error})
    }
};

export const get_stock = async (req:Request, res:Response)=>{
    const {id} = req.params;
    const producto_id = Number(id);
     
    if (isNaN(producto_id)){
        return res.status(400).json({success:false, message:"ID del producto invalido"})
    };

    try{
        const producto = await prisma.producto.findUnique({
            where:{
                producto_id:producto_id
            },
            select:{
                stock_actual:true
            }

        })
        res.json({success:true, data:producto});
    }catch(error){
        console.error("Error al obtener el stock")
        return res.status(500).json({success:false, error})
    }
};

//toxicos
export const get_toxicos = async (req: Request, res: Response) => {
  try {
   
    const haceUnAno = new Date();
    haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);


    const productosToxicos = await prisma.producto.findMany({
      where: {
        OR: [
          // Productos sin movimientos registrados
          {
            movimientos: {
              none: {}
            }
          },
          // Productos con movimientos, pero todos anteriores a hace un año
          {
            movimientos: {
              every: {
                fecha: {
                  lt: haceUnAno
                }
              }
            }
          }
        ]
      },
      select: {
        producto_id: true,
        marca: true,
        modelo: true,
        stock_actual: true,
        fecha_ultima_compra: true,
        movimientos: {
          select: {
            fecha: true
          }
        }
      }
    });

   
    if (productosToxicos.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay productos tóxicos (sin uso en más de 1 año)"
      });
    }

    return res.status(200).json({
      success: true,
      data: productosToxicos
    });
  } catch (error) {
    console.error("Error al obtener productos tóxicos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los productos tóxicos"
    });
  }
};
//crear movimiento
export const post_movimiento = async (req:Request, res:Response) =>{
  const {id} = req.params;
  const producto_id= Number(id);

  if (isNaN(producto_id)){
    return res.status(400).json({success:false, message:"ID del producto invalido"});
  }
  
    const {
      tipo_id,
      cantidad,
      responsable_id,
      centro_costo_id,
      observaciones
    }= req.body;

    if (!tipo_id || !cantidad||!responsable_id|| !centro_costo_id||!observaciones){
      return res.status(400).json({success:false, message:"Faltan campos"})
    }
  try{
    const producto = await prisma.producto.findUnique({
      where:{producto_id},
      select:{stock_actual:true,precio_unitario:true}
    });

    if(!producto){
      return res.status(404).json({success:false, message:"Producto no encontrado"});
    };

    let newStock = producto.stock_actual;
    if(tipo_id===5){
      newStock +=cantidad;
    }else if (tipo_id===6){
      if(producto.stock_actual<cantidad){
        return res.status(400).json({success:false, message: "stock insuficiente para realizar la salida"});
      }newStock -= cantidad;
    }else{
      return res.status(400).json({success:false, message:"Movimiento invalido"})
    }

    const movimiento = await prisma.movimiento.create({
      data:{
        tipo_id,
        producto_id,
        cantidad,
        responsable_id,
        centro_costo_id,
        precio_unitario:producto.precio_unitario,
        observaciones
      },
    });

    await prisma.producto.update({
      where:{producto_id},
      data:{
        stock_actual: newStock,
        ...(tipo_id ===5 && {fecha_ultima_compra: new Date}),
      }
    })

    await prisma.bitacora.create({
      data:{
        usuario_id: responsable_id,
        accion:"MOVIMIENTO",
        entidad:"Producto",
        entidad_id:producto_id,
        descripcion:`Movimiento de ${cantidad} unidades (${tipo_id===5 ? "entrada" : "salida"})`,
      },
    });

    return res.status(201).json({
      success:true,
      message:"Movimiento registrado correctamente",
      data:movimiento,
    })
     
      
  }catch(error){
    console.log("Error al registrar movimiento",error);
    return res.status(500).json({
      success:false,
      message:"Error al registrar movimiento"
    })
  }
};


export const get_alertas = async(req:Request, res:Response)=>{
  try{
      const products = await prisma.producto.findMany({
      where:{
        stock_actual:{
          lt:5
        },
      },
      select:{
        producto_id:true,
        marca:true,
        modelo:true,
        stock_actual:true,
        precio_unitario:true,
        proveedor:{
          select:{
            nombre:true,
          },
        },
      },
    });
    if(products.length===0){
      return res.status(200).json({
        success:true,
        message:"No hay productos con bajo stock"
      })
    };
    return res.status(200).json({
      success:true,
      data:products,
    })
  }catch(error){
    console.error("Error a obtener productos de bajo stock");
    return res.status(500).json({
        success:false,
        message:"Error al obtener alertas stock"
    })

  }
  
}