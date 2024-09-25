(async () => {
    const triangleVertWGSL = await fetch('./triangle.shader.wgsl').then(res => res.text());
    const redFragWGSL = await fetch('./red.frag.shader.wgsl').then(res => res.text());
    // const { quitIfWebGPUNotAvailable } = await import('../util.js');
  
    const canvas = document.querySelector('canvas');
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    // quitIfWebGPUNotAvailable(adapter, device);
  
    const context = canvas.getContext('webgpu');
  
    const devicePixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  
    context.configure({
      device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    });
  
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: triangleVertWGSL,
        }),
      },
      fragment: {
        module: device.createShaderModule({
          code: redFragWGSL,
        }),
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
  
    function frame() {
      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();
  
      const renderPassDescriptor = {
        colorAttachments: [
          {
            view: textureView,
            clearValue: [0, 0, 0, 1],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      };
  
      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(pipeline);
      passEncoder.draw(3);
      passEncoder.end();
  
      device.queue.submit([commandEncoder.finish()]);
      requestAnimationFrame(frame);
    }
  
    requestAnimationFrame(frame);
  })();
  