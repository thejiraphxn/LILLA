import Image from "next/image";
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ForumIcon from '@mui/icons-material/Forum';
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col max-w-screen mx-auto h-screen p-4 bg-zinc-800">
        <div className="grid grid-cols-1 bg-zinc-800 pb-4 justify-items-center">
          {/* <h3 className="text-white">
            Llama 3.2 Model (Home)
          </h3> */}
        </div>

          <div className="content-center gap-5 h-screen ">
            <h3 className="text-white text-center mb-10 font-bold text-xl">
              LILLA (Llama 3.2 Model)
            </h3>
            {/* <Link className="cursor-pointer mt-4 w-full bg-zinc-600 text-white px-5 py-3 cursor-pointer rounded-xl hover:bg-zinc-700 transition ease-in-out duration-200">
              <ForumIcon/> Chat
            </Link> */}
            <div className="grid grid-cols-1 lg:w-1/5 md:w-3/5 sm:w-full justify-self-center">
              <Link href='/Chat' className="no-underline text-inherit cursor-pointer mt-4 w-full bg-zinc-600 text-white px-5 py-3 rounded-xl hover:bg-zinc-700 transition ease-in-out duration-200">
                <ForumIcon/> 
                <span className="ps-5 text-center">Chat</span>
              </Link>

              <Link href='/ObjectRecognition' className="cursor-pointer mt-4 w-full bg-zinc-600 text-white px-5 py-3 cursor-pointer rounded-xl hover:bg-zinc-700 transition ease-in-out duration-200">
                <ImageSearchIcon/>
                <span className="ps-5"> Object Recognition</span>
              </Link>
            </div>
          </div>
        
        
      </div>
    </>
  );
}
