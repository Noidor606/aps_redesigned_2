<?php
// Подключаем PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Проверяем, что запрос пришел методом POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // ================== НАСТРОЙКИ, КОТОРЫЕ НУЖНО ЗАПОЛНИТЬ ==================
    
    // --- Почта для отправки (нужно создать на хостинге или использовать существующую) ---
    $fromEmail = 'noreply@yourdomain.com'; // ЗАМЕНИ НА СВОЮ ПОЧТУ (например, та же, что и ниже)
    $fromName = 'Заявка с сайта АПС Сочи';
    
    // --- Почта для получения заявок ---
    $toEmail = 'avtopolivsochi@yandex.ru'; // ТВОЯ РАБОЧАЯ ПОЧТА
    
    // --- Настройки SMTP для почты $fromEmail (узнать у хостинг-провайдера или в справке почтового сервиса) ---
    $mailHost = 'smtp.yandex.ru';     // SMTP сервер. Для Яндекса - smtp.yandex.ru, для Mail.ru - smtp.mail.ru
    $mailUsername = $fromEmail;        // Логин от почты, с которой отправляем.
    $mailPassword = 'YOUR_APP_PASSWORD'; // ВАЖНО: НЕ ПАРОЛЬ ОТ ПОЧТЫ, а специальный пароль для приложений. Создается в настройках почты Яндекса/Mail.ru/Google.
    $mailPort = 465;                   // Порт SMTP. Обычно 465 для SSL.

    // ================== /НАСТРОЙКИ ==================

    // Собираем данные из формы и очищаем их
    $service = isset($_POST['service']) ? htmlspecialchars($_POST['service']) : 'Не указана';
    $name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : 'Не указано';
    $phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : 'Не указан';
    $comment = isset($_POST['comment']) ? nl2br(htmlspecialchars($_POST['comment'])) : 'Нет';

    $subject = "Новая заявка на услугу: {$service}";

    // Формируем тело письма в HTML
    $body = "
        <html>
        <body style='font-family: Arial, sans-serif; font-size: 14px; color: #333;'>
            <h2 style='color: #2c3e50;'>Новая заявка с сайта \"Автополив Сочи\"</h2>
            <table cellpadding='10' border='1' style='border-collapse: collapse; width: 100%;'>
                <tr style='background-color: #f8f8f8;'><td style='width: 150px;'><strong>Услуга:</strong></td><td>{$service}</td></tr>
                <tr><td><strong>Имя:</strong></td><td>{$name}</td></tr>
                <tr style='background-color: #f8f8f8;'><td><strong>Телефон:</strong></td><td>{$phone}</td></tr>
                <tr><td><strong>Комментарий:</strong></td><td>{$comment}</td></tr>
            </table>
        </body>
        </html>
    ";

    $mail = new PHPMailer(true);
    $response = [];

    try {
        $mail->isSMTP();
        $mail->Host       = $mailHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $mailUsername;
        $mail->Password   = $mailPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = $mailPort;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($toEmail);

        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == 0) {
            $mail->addAttachment($_FILES['attachment']['tmp_name'], $_FILES['attachment']['name']);
        }
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        
        $mail->send();
        $response = ['status' => 'success', 'message' => 'Спасибо! Ваша заявка успешно отправлена.'];

    } catch (Exception $e) {
        // Закомментируйте $mail->ErrorInfo в финальной версии, чтобы не показывать пользователю технические детали
        $response = ['status' => 'error', 'message' => "Ошибка отправки. Пожалуйста, попробуйте еще раз." /* . $mail->ErrorInfo */ ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);

} else {
    http_response_code(403);
    echo "Доступ запрещен.";
}
?>