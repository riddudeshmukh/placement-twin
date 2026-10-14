"""Rebuild the local, procedural 3D film. Requires Pillow, numpy, ffmpeg."""
import math, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]; out=root/'public/media';out.mkdir(parents=True,exist_ok=True)
W,H=960,800
u=np.linspace(0,2*np.pi,193);v=np.linspace(0,2*np.pi,49)
U,V=np.meshgrid(u,v,indexing='ij')
base=np.stack([(2.0+.64*np.cos(V))*np.cos(U), (2.0+.64*np.cos(V))*np.sin(U), .64*np.sin(V)],-1)
light=np.array([-.4,-.6,1.0]);light/=np.linalg.norm(light)
pipe=subprocess.Popen(['ffmpeg','-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r','24','-i','-','-an','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-g','12','-movflags','+faststart',str(out/'twin-orbit.mp4')],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
for f in range(144):
 t=f/143;a=.62+t*1.25;b=.46+t*1.7
 rx=np.array([[1,0,0],[0,math.cos(a),-math.sin(a)],[0,math.sin(a),math.cos(a)]])
 ry=np.array([[math.cos(b),0,math.sin(b)],[0,1,0],[-math.sin(b),0,math.cos(b)]])
 rz=np.array([[math.cos(-.4),-math.sin(-.4),0],[math.sin(-.4),math.cos(-.4),0],[0,0,1]])
 p=base@(rx@ry@rz).T
 scale=118*(1+.18*math.sin(t*math.pi));pers=8/(8-p[:,:,2]);xy=p[:,:,:2]*pers[:,:,None]*scale+np.array([W/2,H/2])
 image=Image.new('RGB',(W,H),(16,19,23));d=ImageDraw.Draw(image)
 for r in range(6):
  y=H*.73+r*24;d.line([(0,y),(W,y)],fill=(23,27,32))
 for x in range(-W,2*W,100):d.line([(W/2,H*.5),(x,H)],fill=(23,27,32))
 faces=[]
 for i in range(192):
  for j in range(48):
   verts=p[i:i+2,j:j+2];n=np.cross(verts[1,0]-verts[0,0],verts[0,1]-verts[0,0]);n/=np.linalg.norm(n)
   if n[2]<-.1:continue
   lam=max(0,np.dot(n,light));spec=max(0,np.dot(n,np.array([-.15,-.2,.96])))**24
   color=tuple(int(min(255,c*(.22+.72*lam)+90*spec)) for c in (207,188,159))
   pts=[tuple(xy[i,j]),tuple(xy[i+1,j]),tuple(xy[i+1,j+1]),tuple(xy[i,j+1])]
   faces.append((verts[:,:,2].mean(),pts,color))
 for _,pts,color in sorted(faces,key=lambda x:x[0]):d.polygon(pts,fill=color)
 if f==0:image.save(out/'twin-orbit-poster.jpg',quality=92)
 pipe.stdin.write(image.tobytes())
pipe.stdin.close();pipe.wait()
print(out/'twin-orbit.mp4')
