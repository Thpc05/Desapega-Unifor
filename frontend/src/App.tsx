import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/Landing';
import { ItemDetail } from './pages/ItemDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NewItem } from './pages/NewItem';
import { MyItems } from './pages/MyItems';
import { Profile } from './pages/Profile';
import { Inbox } from './pages/Inbox';
import { Chat } from './pages/Chat';
import { ReadReview } from './pages/ReadReview';
import { WriteReview } from './pages/WriteReview';
import { NotFound } from './pages/NotFound';
import { StyleGuide } from './pages/StyleGuide';

/**
 * App = rotas do site.
 * Tudo dentro de <AppShell/> compartilha a navegação flutuante (dynamic island).
 * As rotas logadas ficam sob <ProtectedRoute/> (redireciona pro /entrar sem sessão).
 * Login/Cadastro ficam fora da casca (telas cheias, sem navegação).
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* telas com navegação */}
        <Route element={<AppShell />}>
          {/* públicas */}
          <Route index element={<Landing />} />
          <Route path="item/:id" element={<ItemDetail />} />
          <Route path="perfil/:id" element={<Profile />} />
          <Route path="review/:reviewId" element={<ReadReview />} />
          <Route path="style" element={<StyleGuide />} />

          {/* protegidas (exigem login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="anunciar" element={<NewItem />} />
            <Route path="meus" element={<MyItems />} />
            <Route path="avaliar/:itemId" element={<WriteReview />} />
            <Route path="chat" element={<Inbox />} />
            <Route path="chat/:id" element={<Chat />} />
          </Route>
        </Route>

        {/* telas cheias (sem navegação) */}
        <Route path="entrar" element={<Login />} />
        <Route path="cadastro" element={<Register />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
